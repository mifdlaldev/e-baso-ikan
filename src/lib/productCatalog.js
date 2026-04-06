import { getProductImage } from './productImages';

export const MENU_PRODUCTS = [
    {
        id: 1,
        slug: 'baso-ikan-original',
        name: 'Baso Ikan Original',
        shortName: 'Original',
        description: 'Baso ikan goreng renyah dengan saus khas gurih-manis yang jadi favorit utama e-baso-ikan.',
        longDescription: 'Baso ikan signature dengan kulit luar renyah, bagian tengah tetap juicy, dan rasa ikan yang berani. Cocok untuk teman istirahat, pulang sekolah, atau sekadar pengin camilan hangat yang cepat datang.',
        price: 15000,
        category: 'Signature',
        image: getProductImage({ id: 1, name: 'Baso Ikan Original' }),
        popular: true,
        available: true,
        accent: 'from-[#1f5c57] via-[#2d7a72] to-[#8abfa7]',
        calories: '240 kkal',
        prepTime: '5-7 menit',
        freshness: 'Digoreng Saat Dipesan',
        servingNote: 'Pas untuk snack cepat dan gurih.',
        addons: [
            { key: 'spicySauce', label: 'Ekstra Saus Pedas', price: 3000 },
            { key: 'extraCup', label: 'Kemasan Takeaway', price: 2000 }
        ]
    },
    {
        id: 9,
        slug: 'baso-ikan-jumbo',
        name: 'Baso Ikan Jumbo',
        shortName: 'Jumbo',
        description: 'Porsi lebih besar, lebih puas, dan tetap renyah. Cocok untuk yang mau baso ikan dengan bite lebih tebal.',
        longDescription: 'Baso ikan jumbo dibuat untuk pelanggan yang suka tekstur lebih padat dan rasa gurih yang lebih lama terasa. Porsinya lebih besar, tampil lebih berani, dan pas untuk menu unggulan harian.',
        price: 22000,
        category: 'Best Seller',
        image: getProductImage({ id: 9, name: 'Baso Ikan Jumbo' }),
        popular: true,
        available: true,
        accent: 'from-[#c96c43] via-[#de8657] to-[#f2c28f]',
        calories: '320 kkal',
        prepTime: '7-9 menit',
        freshness: 'Baru Diangkat',
        servingNote: 'Pilihan paling puas buat makan lebih kenyang.',
        addons: [
            { key: 'spicySauce', label: 'Ekstra Saus Pedas', price: 3000 },
            { key: 'extraPortion', label: 'Tambah 1 Baso Jumbo', price: 7000 }
        ]
    },
    {
        id: 10,
        slug: 'baso-ikan-mie',
        name: 'Baso Ikan Mie',
        shortName: 'Mie Hangat',
        description: 'Perpaduan baso ikan dan mie hangat yang lebih mengenyangkan tanpa kehilangan rasa gurih lautnya.',
        longDescription: 'Baso ikan mie menghadirkan kombinasi kuah ringan, mie lembut, dan baso ikan gurih yang bikin menu ini terasa lebih lengkap. Cocok untuk jam makan siang atau ketika ingin menu yang lebih comforting.',
        price: 20000,
        category: 'Comfort Bowl',
        image: getProductImage({ id: 10, name: 'Baso Ikan Mie' }),
        popular: false,
        available: true,
        accent: 'from-[#2d3b73] via-[#3b4e92] to-[#8aa1e6]',
        calories: '390 kkal',
        prepTime: '8-10 menit',
        freshness: 'Diracik Saat Dipesan',
        servingNote: 'Paling pas untuk porsi makan siang.',
        addons: [
            { key: 'extraNoodle', label: 'Ekstra Mie', price: 4000 },
            { key: 'spicySauce', label: 'Ekstra Saus Pedas', price: 3000 }
        ]
    },
    {
        id: 11,
        slug: 'es-teh-manis',
        name: 'Es Teh Manis',
        shortName: 'Es Teh',
        description: 'Minuman pendamping dingin yang ringan, segar, dan pas menyeimbangkan gurihnya baso ikan.',
        longDescription: 'Es teh manis diracik sederhana, dingin, dan bersih rasanya. Cocok jadi pasangan semua menu baso ikan, terutama untuk menjaga ritme rasa tetap segar dari gigitan pertama sampai terakhir.',
        price: 8000,
        category: 'Minuman',
        image: getProductImage({ id: 11, name: 'Es Teh Manis' }),
        popular: false,
        available: true,
        accent: 'from-[#7a4c2c] via-[#a86d42] to-[#e7c59a]',
        calories: '110 kkal',
        prepTime: '2-3 menit',
        freshness: 'Disajikan Dingin',
        servingNote: 'Paling cocok jadi partner semua menu gurih.',
        addons: [
            { key: 'lessSugar', label: 'Less Sugar', price: 0 },
            { key: 'lemonSlice', label: 'Tambah Lemon', price: 2000 }
        ]
    }
];

export function getProductBySlug(slug) {
    return MENU_PRODUCTS.find((product) => product.slug === slug) || MENU_PRODUCTS[0];
}

export function getProductById(productId) {
    return MENU_PRODUCTS.find((product) => product.id === productId) || MENU_PRODUCTS[0];
}
