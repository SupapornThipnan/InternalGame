window.fetch = () => Promise.resolve({ text: async () => JSON.stringify({ ok:true, data:[] }) });
const mk = (d,w,f,m) => ({'ID':d,'วันที่':d,'น้ำหนัก (กก.)':w,'เปอร์เซ็นต์ไขมัน (%)':'','มวลไขมัน (กก.)':f,'มวลกล้ามเนื้อ (กก.)':m});
const SETS = {
  '#few': [ mk('2026-08-18 15:38',63.8,23.2,38.3), mk('2026-08-19 08:12',63.4,22.9,38.4) ],
  '#many': Array.from({length:12},(_,i)=>{
      const d=new Date(2026,7,8+i,7,30); const p=n=>String(n).padStart(2,'0');
      return mk(`${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`,
        +(63.8-i*0.13+(i%3)*0.09).toFixed(1), +(23.2-i*0.11+(i%4)*0.06).toFixed(1), +(38.3+i*0.05-(i%3)*0.04).toFixed(1)); }),
  '#gap': [ mk('2026-08-14 07:00',64.2,'',38.0), mk('2026-08-16 07:00',63.9,23.5,''),
            mk('2026-08-18 15:38',63.8,23.2,38.3), mk('2026-08-19 08:12',63.4,22.9,38.4) ],
  '#one': [ mk('2026-08-19 08:12',63.4,22.9,38.4) ],
};
window.addEventListener('load', () => {
  switchTab('history');
  document.getElementById('hEmpty').style.display='none';
  document.getElementById('hTable').innerHTML='';
  drawTrend(SETS[location.hash] || SETS['#many']);
});
