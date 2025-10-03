async function getConversacionById(id, options) {
  const repoResponse = {
    items: [
      {
        userId: '123',
        conversacionId: '21331222',
        emisor: 'x',
        receptor: 'Sorby',
        message:
          'https://storage.googleapis.com/factudata-3afdf.appspot.com/comprobantes-prueba/5493424421565%40s.whatsapp.net/2025-06-06/817151.jpeg?GoogleAccessId=firebase-adminsdk-xts1d%40factudata-3afdf.iam.gserviceaccount.com&Expires=16447017600&Signature=vwqFrH6l%2BtLVaGOQY1Iiaz2ZkoenjurAgs1dTsybTsuC0SoaFez6O4bJz69qWW4JJr7QxZKmQRlMoPu6GZoeKl0nPjvBllHZmwFqqyfq4o1emEQP2va7P6svlKvyXm1b5PbuSkzx37xjfEa1b%2FluvxhZNLA6%2BAdroIM9%2BY2vHKFXFnAo9vOFB16C2WkIpef516adkWfPOaKGu4rCcX3qrXgvVU1s2CvENhx4mluICF0yJJky8sOC7YSyq2flaMfW3f91TA5UG7UD1vVkFS%2FS7GiG7CLCNEeOBoG4Rle8Ayw03Qq7XnhKSRf%2BZWBnSEYHah8tUkS5MXsa0MzXt3r7sA%3D%3D',
        type: 'image',
        caption: 'hola como estas?',
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
        userId: '12341',
        conversacionId: '2132232',
        emisor: 'x',
        receptor: 'Sorby',
        message: 'Holaaaaa, como estas?',
        type: 'text',
        caption: null,
        fecha: new Date(),
        empresa: {
          id: '3144',
          nombre: 'Empresa 1',
        },
        profile: {
          userId: '23131331',
          firstName: 'Juancito',
          lastName: 'Perez',
          email: 'juan.perez@gmail.com',
          phone: '1234567890',
        },
      },
    ],
    total: 2,
  };

  await new Promise((resolve) => setTimeout(resolve, 200));
  return repoResponse;
}

async function getConversaciones(options) {
  const repoResponse = [
    {
      userId: '123',
      conversacionId: '21331222',
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

module.exports = {
  getConversacionById,
  getConversaciones,
};
