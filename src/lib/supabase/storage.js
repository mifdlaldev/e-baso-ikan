export function getProductImagesBucket() {
    return process.env.SUPABASE_PRODUCT_IMAGES_BUCKET || 'product-images';
}
