function isConfiguredValue(value) {
    return Boolean(value && !String(value).startsWith('your-'));
}

function parseBoolean(value) {
    return ['1', 'true', 'yes', 'on'].includes(String(value || '').toLowerCase());
}

export function getMidtransEnv() {
    const isProduction = parseBoolean(process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION);

    return {
        clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
        serverKey: process.env.MIDTRANS_SERVER_KEY,
        isProduction
    };
}

export function hasMidtransClientEnv() {
    const { clientKey } = getMidtransEnv();
    return isConfiguredValue(clientKey);
}

export function hasMidtransServerEnv() {
    const { clientKey, serverKey } = getMidtransEnv();
    return isConfiguredValue(clientKey) && isConfiguredValue(serverKey);
}

export function assertMidtransClientEnv() {
    const { clientKey, isProduction } = getMidtransEnv();

    if (!clientKey) {
        throw new Error('Midtrans client key belum diisi. Tambahkan NEXT_PUBLIC_MIDTRANS_CLIENT_KEY di .env.');
    }

    return { clientKey, isProduction };
}

export function assertMidtransServerEnv() {
    const { clientKey, serverKey, isProduction } = getMidtransEnv();

    if (!clientKey || !serverKey) {
        throw new Error('Midtrans environment variables belum lengkap. Isi NEXT_PUBLIC_MIDTRANS_CLIENT_KEY dan MIDTRANS_SERVER_KEY di .env.');
    }

    return { clientKey, serverKey, isProduction };
}

export function getMidtransSnapScriptUrl() {
    const { isProduction } = getMidtransEnv();
    return isProduction
        ? 'https://app.midtrans.com/snap/snap.js'
        : 'https://app.sandbox.midtrans.com/snap/snap.js';
}

export function getMidtransSnapApiUrl() {
    const { isProduction } = getMidtransEnv();
    return isProduction
        ? 'https://app.midtrans.com/snap/v1/transactions'
        : 'https://app.sandbox.midtrans.com/snap/v1/transactions';
}

export function getMidtransCoreApiBaseUrl() {
    const { isProduction } = getMidtransEnv();
    return isProduction
        ? 'https://api.midtrans.com/v2'
        : 'https://api.sandbox.midtrans.com/v2';
}
