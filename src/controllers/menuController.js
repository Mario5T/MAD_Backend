import prisma from "../db/db.config.js";
import xlsx from "xlsx";
import multer from "multer";
import path from "path";
import fs from "fs";

export const upload = multer({
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    console.log("File upload request:", {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "application/octet-stream",
    ];
    
    const allowedExtensions = [".xlsx", ".xls"];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
      console.log("File accepted:", file.originalname);
      cb(null, true);
    } else {
      console.log("File rejected:", file.originalname, "MIME:", file.mimetype, "Extension:", fileExtension);
      cb(new Error("Only Excel files are allowed"), false);
    }
  },
});

export const uploadMenuFile = async (req, res) => {
  try {
    console.log("Upload request received");
    console.log("Request file:", req.file);
    console.log("Request body:", req.body);
    
    if (!req.file) {
      console.log("No file in request");
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    console.log("File path:", filePath);
    
    try {
      const workbook = xlsx.readFile(filePath);
      console.log("Excel file read successfully");
      console.log("Sheet names:", workbook.SheetNames);
      
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
      
      console.log("Excel data parsed, rows:", jsonData.length);
      console.log("First few rows:", jsonData.slice(0, 5));
      
      if (jsonData.length < 3) {
        throw new Error("Excel file must have at least 3 rows (header, dates, and data)");
      }
      console.log("Clearing existing menu data...");
      await prisma.menuItem.deleteMany();
      await prisma.menuDay.deleteMany();
      console.log("Existing data cleared");

      
      const days = jsonData[1].slice(2).filter(Boolean); 
      const dates = jsonData[2].slice(2).filter(Boolean).map(date => {
        if (typeof date === 'number') {
          return new Date((date - 25569) * 86400 * 1000);
        }
        return new Date(date);
      }); 
      
      console.log("Parsed days:", days);
      console.log("Parsed dates:", dates);
      const mealData = [];
      let currentMealCategory = null;
      
      for (let rowIndex = 3; rowIndex < jsonData.length; rowIndex++) {
        const row = jsonData[rowIndex];
        if (!row || row.length < 2) continue;
        
        const firstCol = row[1]; 
        if (!firstCol) continue;
        
        if (row.length <= 2 || !row[2]) {
          currentMealCategory = firstCol;
          console.log("Found meal category:", currentMealCategory);
        } else {
          const foodType = firstCol;
          const items = row.slice(2, 2 + days.length); 
          
          mealData.push({
            category: currentMealCategory || 'GENERAL',
            foodType: foodType,
            items: items
          });
          
          console.log(`Found food type: ${foodType} with ${items.length} items`);
        }
      }
      
      console.log("Total meal data entries:", mealData.length);
      
      if (days.length === 0 || dates.length === 0 || mealData.length === 0) {
        throw new Error("Invalid Excel format: Missing days, dates, or meal data");
      }

      for (let dayIndex = 0; dayIndex < Math.min(days.length, dates.length); dayIndex++) {
        const day = days[dayIndex];
        const date = dates[dayIndex];
        
        if (isNaN(date.getTime())) {
          console.log("Invalid date for:", day, "using current date");
          date = new Date();
        }
        
        console.log(`Creating menu day for ${day} on ${date.toISOString()}`);
        
        const menuDay = await prisma.menuDay.create({
          data: {
            date,
            mealType: day.toString(),
          },
        });
        
        console.log(`Menu day created with ID: ${menuDay.id}`);
        let itemsCreated = 0;
        for (const mealEntry of mealData) {
          const item = mealEntry.items[dayIndex];
          
          if (item && item.toString().trim()) {
            const menuItemName = `${mealEntry.category} - ${mealEntry.foodType}: ${item.toString().trim()}`;
            
            await prisma.menuItem.create({
              data: {
                name: menuItemName,
                menuDayId: menuDay.id,
              },
            });
            itemsCreated++;
          }
        }
        
        console.log(`Created ${itemsCreated} menu items for ${day}`);
      }
      fs.unlinkSync(filePath);

      console.log("Menu upload completed successfully");
      res.json({ 
        message: "Menu uploaded successfully",
        summary: {
          days: days.length,
          mealEntries: mealData.length,
          totalRows: jsonData.length
        }
      });
    } catch (excelError) {
      console.error("Excel processing error:", excelError);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      res.status(400).json({ 
        error: "Excel processing failed: " + excelError.message,
        details: "Please check the Excel file format"
      });
    }
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ error: "Error processing file: " + error.message });
  }
};

export const getAllMenu = async (req, res) => {
  try {
    const menuDays = await prisma.menuDay.findMany({
      include: {
        items: true,
      },
      orderBy: {
        date: "asc",
      },
    });
    const menuData = {};
    menuDays.forEach((day) => {
      const dayName = day.mealType;
      menuData[dayName] = {
        date: day.date.toISOString().split("T")[0],
        meals: {},
      };

      day.items.forEach((item) => {
        menuData[dayName].meals[item.name] = item.name;
      });
    });

    res.json(menuData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching menu" });
  }
};

export const uploadMenu = async (req, res) => {
  try {
    const { day, mealType, item } = req.body;
    const menuDay = await prisma.menuDay.create({
      data: {
        date: new Date(),
        mealType: mealType,
      },
    });
    
    const menuItem = await prisma.menuItem.create({
      data: {
        name: item,
        menuDayId: menuDay.id,
      },
    });
    
    res.status(201).json({ menuDay, menuItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error uploading menu" });
  }
};

export const getMenuByDay = async (req, res) => {
  try {
    const { day } = req.params;
    const menuDays = await prisma.menuDay.findMany({
      where: { mealType: day },
      include: { items: true },
    });
    res.json(menuDays);
  } catch (error) {
    res.status(500).json({ error: "Error fetching menu" });
  }
};

export const testUpload = async (req, res) => {
  try {
    console.log("Test upload endpoint called");
    console.log("Request headers:", req.headers);
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);
    
    if (req.file) {
      console.log("File details:", {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
      });
      
      fs.unlinkSync(req.file.path);
      
      res.json({ 
        message: "Test upload successful",
        file: {
          name: req.file.originalname,
          size: req.file.size,
          type: req.file.mimetype
        }
      });
    } else {
      res.status(400).json({ error: "No file received" });
    }
  } catch (error) {
    console.error("Test upload error:", error);
    res.status(500).json({ error: "Test upload failed: " + error.message });
  }
};
