import express, { Request, Response, Router } from 'express';
import fs from 'fs';
import path from 'path';
import auth from "../middleware/auth";
import { Users, ShippingAddress, Products, Categories, SubCategories, OrderItems, Review } from '../models'; 

const DummyRouter = Router();
DummyRouter.post('/', (req:Request,res:Response)=>{
  res.json({reached:true});
})

DummyRouter.post('/data', auth, async (_req: Request, res: Response): Promise<any> => {
    try {
        const dataPath = path.join(__dirname, '../data/dummy-data.json');
        const fileContents = fs.readFileSync(dataPath, 'utf8');

        let dummyData;
        try {
            dummyData = JSON.parse(fileContents);
            console.log('Parsed data:', dummyData);
        } catch (jsonError) {
            console.error('Failed to parse JSON:', jsonError);
            return res.status(500).json({ error: 'Invalid JSON in dummy-data.json' });
        }

        const insertedUsers = await Users.insertMany(dummyData.users);
        
        const userIdMap = insertedUsers.reduce((acc, user) => {
            acc[user.userId] = user._id; 
            return acc;
        }, {});

        dummyData.address.forEach((address:any) => {
            if (userIdMap[address.user_id]) {
                address.user_id = userIdMap[address.user_id];
            }
        });

        await ShippingAddress.insertMany(dummyData.address);

        const insertedCategories = await Categories.insertMany(dummyData.categories);

        insertedCategories.forEach((category, index) => {
            dummyData.categories[index]._id = category._id;
            dummyData.categories[index].subCategories.forEach((subCategory:any) => {
                subCategory.parent_id = category._id; 
            });
        });

        await SubCategories.insertMany(dummyData.categories.flatMap((category:any) => category.subCategories));

        const insertedProducts = await Products.insertMany(dummyData.products);
        insertedProducts.forEach((product, index) => {
            dummyData.products[index]._id = product._id; 
        });

        await OrderItems.insertMany(dummyData.orders);
        await Review.insertMany(dummyData.reviews);

        fs.writeFileSync(dataPath, JSON.stringify(dummyData, null, 2));

        return res.json({ message: 'Dummy data inserted successfully!', dummyData });
    } catch (error) {
        console.error('Error inserting dummy data:', error);
        return res.status(500).json({ error: 'Failed to insert dummy data' });
    }
});


export default DummyRouter;
