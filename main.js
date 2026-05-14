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

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
    const lastClick = ref(null); // 最後にクリックした位置
    const tempSeats = ref([]); // クリックした座標のリスト

    // 【座席の座標定義】 (画像の該当箇所をクリックするとコンソールに座標が出ます)
    const seats = ref([
      { id: 'S1', name: '座席 1', x: 19.2, y: 12.9 },
      { id: 'S2', name: '座席 2', x: 30.0, y: 9.2 },
      { id: 'S3', name: '座席 3', x: 83.4, y: 11.2 },
      { id: 'S4', name: '座席 4', x: 90.7, y: 21.5 },
      { id: 'S5', name: '座席 5', x: 87.0, y: 21.5 },
      { id: 'S6', name: '座席 6', x: 83.3, y: 21.5 },
      { id: 'S7', name: '座席 7', x: 50.0, y: 13.4 },
      { id: 'S8', name: '座席 8', x: 43.7, y: 16.2 },
      { id: 'S9', name: '座席 9', x: 36.3, y: 20.8 },
      { id: 'S10', name: '座席 10', x: 55.9, y: 21.8 },
      { id: 'S11', name: '座席 11', x: 49.6, y: 26.1 },
      { id: 'S12', name: '座席 12', x: 42.3, y: 30.0 },
      { id: 'S13', name: '座席 13', x: 57.9, y: 32.2 },
      { id: 'S14', name: '座席 14', x: 52.0, y: 35.1 },
      { id: 'S15', name: '座席 15', x: 46.4, y: 46.5 },
      { id: 'S16', name: '座席 16', x: 54.2, y: 54.8 },
      { id: 'S17', name: '座席 17', x: 64.6, y: 49.7 },
      { id: 'S18', name: '座席 18', x: 11.9, y: 23.2 },
      { id: 'S19', name: '座席 19', x: 11.4, y: 28.6 },
      { id: 'S20', name: '座席 20', x: 11.4, y: 33.4 },
      { id: 'S21', name: '座席 21', x: 18.9, y: 30.8 },
      { id: 'S22', name: '座席 22', x: 11.4, y: 41.7 },
      { id: 'S23', name: '座席 23', x: 19.2, y: 41.7 },
      { id: 'S24', name: '座席 24', x: 19.2, y: 46.2 },
      { id: 'S25', name: '座席 25', x: 14.4, y: 54.0 },
      { id: 'S26', name: '座席 26', x: 13.3, y: 57.8 },
      { id: 'S27', name: '座席 27', x: 24.3, y: 57.8 },
      { id: 'S28', name: '座席 28', x: 12.8, y: 74.1 },
      { id: 'S29', name: '座席 29', x: 12.8, y: 67.7 },
      { id: 'S30', name: '座席 30', x: 23.2, y: 67.7 },
      { id: 'S31', name: '座席 31', x: 23.2, y: 74.2 },
      { id: 'S32', name: '座席 32', x: 68.1, y: 65.3 },
      { id: 'S33', name: '座席 33', x: 79.2, y: 63.1 },
      { id: 'S34', name: '座席 34', x: 79.2, y: 68.6 },
      { id: 'S35', name: '座席 35', x: 90.0, y: 63.1 },
      { id: 'S36', name: '座席 36', x: 90.0, y: 68.6 },
      { id: 'S37', name: '座席 37', x: 90.0, y: 38.9 },
      { id: 'S38', name: '座席 38', x: 90.0, y: 45.8 },
      { id: 'S39', name: '座席 39', x: 79.2, y: 38.9 },
      { id: 'S40', name: '座席 40', x: 79.2, y: 45.8 },
    ]);

    const activeSeats = ref({});
    const selectedSeat = ref(null);
    const form = reactive({ category: '利用者', name: '', notes: '' });

    // 今日の日付を取得
    const getTodayStr = () => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    onMounted(() => {
      const today = getTodayStr();
      // データベースをリアルタイム監視
      onSnapshot(collection(db, 'seat_status'), (snapshot) => {
        const newData = {};
        snapshot.forEach((doc) => {
          const data = doc.data();
          // 午前0時リセット: 保存された日付が今日のものだけ表示
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
        date: getTodayStr(),
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

    // 開発用：画像をクリックした場所の座標を調べる機能
    const getCoordinates = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (((e.clientX - rect.left) / rect.width) * 100).toFixed(1);
      const y = (((e.clientY - rect.top) / rect.height) * 100).toFixed(1);
      console.log(`{ id: 'NEW', name: '新規座席', x: ${x}, y: ${y} },`);

      // 画面上にマーカーを表示
      // lastClick.value = { x, y };

      // コピー用のコード文字列を生成
      const nextId = seats.value.length + tempSeats.value.length + 1;
      const codeLine = `{ id: 'S${nextId}', name: '座席 ${nextId}', x: ${x}, y: ${y} },`;

      // リストの先頭に追加（新しい順に見えるように）
      tempSeats.value.unshift(codeLine);
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
      lastClick,
      tempSeats,
    };
  },
}).mount('#app');
