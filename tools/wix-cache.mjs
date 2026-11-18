// Lưu bản sao các bài đã xuất bản trên Wix (bảng KyYeu) vào wix-cache.json.
// Trang kỷ yếu dùng bản này khi máy người xem không gọi được Wix (mạng chặn, trình chặn quảng cáo…).
import {readFileSync, writeFileSync, existsSync} from 'node:fs';
const CLIENT = 'b88a91a9-e6b5-434c-9e95-487970bb15cc';
const tok = await fetch('https://www.wixapis.com/oauth2/token', {method: 'POST', headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({clientId: CLIENT, grantType: 'anonymous'})}).then(r => r.json());
if (!tok.access_token) throw new Error('Không lấy được token Wix');
const items = [];
for (let offset = 0; ; offset += 100) {
  const q = await fetch('https://www.wixapis.com/wix-data/v2/items/query', {method: 'POST',
    headers: {'Content-Type': 'application/json', Authorization: tok.access_token},
    body: JSON.stringify({dataCollectionId: 'KyYeu', query: {paging: {limit: 100, offset}}})}).then(r => r.json());
  if (!q.dataItems) throw new Error('Wix trả lỗi: ' + JSON.stringify(q).slice(0, 300));
  items.push(...q.dataItems.map(d => ({id: d.id, data: d.data})));
  if (q.dataItems.length < 100) break;
}
if (!items.length) throw new Error('Không có bài nào — không ghi đè bản cũ');
const out = JSON.stringify({dataItems: items}) + '\n';
const old = existsSync('wix-cache.json') ? readFileSync('wix-cache.json', 'utf8') : '';
if (out !== old) { writeFileSync('wix-cache.json', out); console.log('Đã cập nhật', items.length, 'bài'); }
else console.log('Không đổi', items.length, 'bài');
