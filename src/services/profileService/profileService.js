const { api } = require('../../config/axios-node');

const stripJid = (userId) =>
  (userId || '').toString().replace(/@.*/, '').replace(/\D/g, '');

async function getEmpAndprofile(userId) {
  if (!userId) throw new Error('userId requerido');

  const phone = stripJid(userId);

  try {
    const { data } = await api.post('/profile/getByPhone', { phone: phone });
    return {
      empresa: data?.empresa ?? null,
      profile: data?.profile ?? null,
      phone: data?.phone ?? phone,
    };
  } catch (err) {
    if (err?.response?.status === 404) {
      return { empresa: null, profile: null, phone };
    }
    // log útil si vuelve a fallar
    console.error('getEmpAndprofile error:', err?.response?.status, err?.message);
    throw err;
  }
}

module.exports = { getEmpAndprofile };