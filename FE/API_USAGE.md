# API Frontend Helpers

Backend base URL:

```txt
http://localhost:8080/api
```

Nhung script theo dung thu tu:

```html
<script src="../js/api-config.js"></script>
<script src="../js/api-endpoints.js"></script>
<script src="../js/api-client.js"></script>
<script src="../js/api-services.js"></script>
```

Vi du dang nhap:

```js
const res = await API_SERVICES.auth.login('admin@gmail.com', '123456');
API_CLIENT.setToken(res.data.token);
localStorage.setItem(API_CONFIG.USER_KEY, JSON.stringify(res.data));
```

Vi du goi danh sach khach hang:

```js
const res = await API_SERVICES.khachHang.list();
console.log(res.data);
```

Vi du doc thong bao:

```js
const res = await API_SERVICES.thongBao.list();
console.log(res.data);
```

