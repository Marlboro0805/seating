import {
  createApp,
  ref,
  reactive,
  onMounted,
} from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js';
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
} from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyBruI9HbBfAHFBPLJueNOtcHn8cUYdynJU',
  authDomain: 'myapp-8f695.firebaseapp.com',
  projectId: 'myapp-8f695',
  storageBucket: 'myapp-8f695.firebasestorage.app',
  messagingSenderId: '933723574220',
  appId: '1:933723574220:web:6c37b1d93a5b03b4541769',
  measurementId: 'G-6E21Y7F0ZR',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

createApp({
  setup() {
    // 【座席の座標定義】
    // x, y は画像全体の左上を0,0とした時のパーセンテージ(%)
    // ※画像を差し替えたら、アイデア①の機能を使って座標を調整してください
    const seats = ref([
      { id: 'S1', name: '左上 机1', x: 22.5, y: 14.5 },
      { id: 'S2', name: '左側 机2(上)', x: 15.5, y: 22.0 },
      { id: 'S3', name: '左側 机2(下)', x: 16.0, y: 27.5 },
      { id: 'S4', name: '斜め机1(左)', x: 33.5, y: 15.5 },
      { id: 'S5', name: '斜め机1(右)', x: 38.5, y: 11.5 },
      { id: 'S6', name: '右奥 ソファー(上)', x: 77.5, y: 28.0 },
      { id: 'S7', name: '右奥 ソファー(下)', x: 78.0, y: 36.5 },
      // ... 必要に応じて座席を追加
    ]);

    const activeSeats = ref({}); // Firebaseから取得した今日のデータ
    const selectedSeat = ref(null);
    const form = reactive({ category: '利用者', name: '', notes: '' });

    // 今日の日付文字列を取得 (例: "2026-05-13")
    const getTodayStr = () => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    onMounted(() => {
      const today = getTodayStr();
      // Firestoreの "seat_status" コレクションをリアルタイム監視
      onSnapshot(collection(db, 'seat_status'), (snapshot) => {
        const newData = {};
        snapshot.forEach((doc) => {
          const data = doc.data();
          // 午前0時リセットのロジック: 保存された日付が「今日」のものだけ有効とする
          if (data.date === today) {
            newData[doc.id] = data;
          }
        });
        activeSeats.value = newData;
      });
    });

    const isOccupied = (id) => !!activeSeats.value[id];
    const getOccupant = (id) => activeSeats.value[id] || {};

    const openModal = (seat) => {
      selectedSeat.value = seat;
      if (!isOccupied(seat.id)) {
        form.category = '利用者';
        form.name = '';
        form.notes = '';
      }
    };

    const closeModal = () => {
      selectedSeat.value = null;
    };

    const saveSeat = async () => {
      if (!form.name) return;
      const seatRef = doc(db, 'seat_status', selectedSeat.value.id);
      await setDoc(seatRef, {
        category: form.category,
        name: form.name,
        notes: form.notes,
        date: getTodayStr(), // チェックインした日付を保存
        timestamp: new Date(),
      });
      closeModal();
    };

    const vacateSeat = async () => {
      if (confirm('退席しますか？')) {
        await deleteDoc(doc(db, 'seat_status', selectedSeat.value.id));
        closeModal();
      }
    };

    // 開発者用お助けツール：クリックした場所の座標(%)をコンソールに出力
    const getCoordinates = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (((e.clientX - rect.left) / rect.width) * 100).toFixed(1);
      const y = (((e.clientY - rect.top) / rect.height) * 100).toFixed(1);
      console.log(`{ id: 'NEW', name: '新規座席', x: ${x}, y: ${y} },`);
    };

    return {
      seats,
      activeSeats,
      selectedSeat,
      form,
      isOccupied,
      getOccupant,
      openModal,
      closeModal,
      saveSeat,
      vacateSeat,
      getCoordinates,
    };
  },
}).mount('#app');