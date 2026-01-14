Preguntas de Reflexión
Seguridad (Cookies vs LocalStorage): Las cookies con httpOnly son más seguras porque el código de JavaScript no las puede tocar. Analogía: LocalStorage es como dejar la llave de tu casa pegada en la puerta con cinta; cualquier virus (XSS) la puede agarrar. Una cookie httpOnly es como si la llave estuviera dentro de una caja fuerte que solo el portero (el navegador) puede usar para abrirte, pero nadie la puede ver.

Atributo sameSite: 'strict': Sirve para que la cookie solo se envíe si estás dentro de tu propia página oficial. Previene ataques CSRF, que son como si alguien te engañara para firmar un documento sin que te des cuenta.

¿Qué pasa si falta credentials: 'include'? Si no lo pones, el navegador no enviará la cookie al servidor. Aunque estés logueado, el servidor dirá "Token no proporcionado" porque nunca le llegó la cookie.