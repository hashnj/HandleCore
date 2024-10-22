import express, { Request, Response } from 'express';
import { SubCategories, Categories } from '../models';
import  auth  from '../middleware/auth';
import { CategorySchema, SubCategorySchema } from '../schema/category';

const categoryRouter = express.Router();

interface Category {
    name: string;
    description: string;
    cat_img: string;
    isSubCategory?: boolean;
    parent?: string;
}

interface UpdateRequest extends Request {
    body: { category: Partial<Category> };
}

categoryRouter.post('/add', auth, async (req: Request, res: Response):Promise<any> => {
    const { category }: { category: Category } = req.body;

    try {
        if (category.isSubCategory) {
            const result = SubCategorySchema.safeParse(category);
            if (!result.success) {
                return res.status(400).json({ errors: result.error.errors });
            }

            const parentCategory = await Categories.findOne({ name: category.parent });
            if (!parentCategory) {
                return res.status(404).json({ error: 'Parent category not found' });
            }

            const subCategory = await SubCategories.create({
                name: category.name,
                description: category.description,
                parent_id: parentCategory._id,
                cat_img: category.cat_img,
            });

            return res.status(201).json({ message: 'Subcategory added', subCategory });
        } else {
            const result = CategorySchema.safeParse(category);
            if (!result.success) {
                return res.status(400).json({ errors: result.error.errors });
            }

            const existingCategory = await Categories.findOne({ name: category.name });
            if (existingCategory) {
                return res.status(409).json({ error: 'Category already exists' });
            }

            const newCategory = await Categories.create(category);
            return res.status(201).json({ message: 'Category added', category: newCategory });
        }
    } catch (error) {
        console.error('Error adding category:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

categoryRouter.put('/update/:id', auth, async (req: UpdateRequest, res: Response) : Promise<any> => {
    const { id } = req.params;
    const { category } = req.body;

    try {
        const updateData = category.parent
            ? await SubCategories.findByIdAndUpdate(id, category, { new: true })
            : await Categories.findByIdAndUpdate(id, category, { new: true });

        if (!updateData) {
            return res.status(404).json({ error: 'Category or Subcategory not found' });
        }

        res.status(200).json({ message: 'Category updated', category: updateData });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

categoryRouter.get('/', auth, async (_req: Request, res: Response) : Promise<any> => {
    try {
        const categories = await Categories.find();
        const subCategories = await SubCategories.find();
        res.json({ categories, subCategories });
    } catch (error) {
        console.error('Error fetching categories and subcategories:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default categoryRouter;
