import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
  vus: 3000,         // Virtual Users
  duration: '30s',  // ทดสอบเป็นเวลา 30 วินาที
};

export default function () {
  http.get('https://supapornthipnan.github.io/InternalGame/Games/PersonalValue/index.html');
  sleep(1); // จำลอง user ใช้งานหน้าเว็บสักพัก
}
