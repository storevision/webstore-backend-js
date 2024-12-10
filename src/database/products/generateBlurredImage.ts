import fs from 'fs';
import sharp from 'sharp';

import getClient from '@/database/db';

export interface EncodedBlurredImage {
    base64: string;
    width: number;
    height: number;
}

export const createBlurredBase64 = async (
    imageArray: Uint8Array,
): Promise<EncodedBlurredImage> => {
    const image = sharp(imageArray).resize(16, 16, {
        fit: 'cover',
    });

    const info = await image.metadata();

    if (!info.width || !info.height) {
        throw new Error('Failed to read image metadata');
    }

    const buffer = await image.toBuffer();

    const base64 = buffer.toString('base64');

    return {
        base64,
        width: info.width,
        height: info.height,
    };
};

export const generateBlurredImage = async (): Promise<void> => {
    const client = await getClient();

    try {
        const { rows } = await client.query(
            'SELECT id, image_url FROM products WHERE blurred_image IS NULL and image_url LIKE $1',
            ['/api/assets/%'],
        );

        if (rows.length === 0) {
            console.log('No products need to generate blurred images');
            return;
        }

        console.log('Generating blurred images for', rows.length, 'products');

        const promises = rows.map(async ({ id, image_url: imageUrl }) => {
            const start = Date.now();

            console.log('Generating blurred image for product', id);

            const rewriteImageUrl = imageUrl.replace('/api/assets/', 'assets/');

            const imageBuffer = fs.readFileSync(rewriteImageUrl);

            const blurredImage = await createBlurredBase64(imageBuffer);

            const end = Date.now();

            console.log(
                `Generated blurred image for product ${id} with dimensions ${blurredImage.width}x${blurredImage.height} in ${
                    end - start
                }ms (base64 size: ${blurredImage.base64.length})`,
            );

            await client.query(
                'UPDATE products SET blurred_image = $1, blurred_image_width = $2, blurred_image_height = $3 WHERE id = $4',
                [
                    blurredImage.base64,
                    blurredImage.width,
                    blurredImage.height,
                    id,
                ],
            );
        });

        await Promise.all(promises);

        console.log('Generated blurred images for all products');
    } finally {
        client.release();
    }
};

export default {
    generateBlurredImage,
};
