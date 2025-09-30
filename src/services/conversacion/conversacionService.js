async function getConversacionById(id, options) {
  const repoResponse = [
    {
      userId: '123',
      conversacionId: '21331',
      emisor: 'x',
      receptor: 'Sorby',
      message: 'Hola, como estas?',
      type: 'text',
      caption: null,
      fecha: new Date(),
      empresa: {
        id: '3144',
        nombre: 'Empresa 1',
      },
      profile: {
        userId: '23131331',
        firstName: 'Juan',
        lastName: 'Perez',
        email: 'juan.perez@gmail.com',
        phone: '1234567890',
      },
    },
    {
      userId: '123',
      conversacionId: '21331',
      emisor: 'x',
      receptor: 'Sorby',
      message: 'Hola, como estas?',
      type: 'text',
      caption: null,
      fecha: new Date(),
      empresa: {
        id: '3144',
        nombre: 'Empresa 1',
      },
      profile: {
        userId: '23131331',
        firstName: 'Juan',
        lastName: 'Perez',
        email: 'juan.perez@gmail.com',
        phone: '1234567890',
      },
    },
  ];

  await new Promise((resolve) => setTimeout(resolve, 200));
  return repoResponse;
}

async function getConversaciones(options) {
  const repoResponse = [
    {
      userId: '123',
      conversacionId: '21331',
      emisor: 'x',
      receptor: 'Sorby',
      message: 'Hola, como estas?',
      type: 'text',
      caption: null,
      fecha: new Date(),
    },
    {
      userId: '123',
      conversacionId: '21331',
      emisor: 'x',
      receptor: 'Sorby',
      message: 'Hola, como estas?',
      type: 'text',
      caption: null,
      fecha: new Date(),
    },
  ];

  await new Promise((resolve) => setTimeout(resolve, 200));
  return repoResponse;
}

module.exports = {
  getConversacionById,
  getConversaciones,
};
