import { createApp, ref, reactive, onMounted } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBruI9HbBfAHFBPLJueNOtcHn8cUYdynJU",
  authDomain: "myapp-8f695.firebaseapp.com",
  projectId: "myapp-8f695",
  storageBucket: "myapp-8f695.firebasestorage.app",
  messagingSenderId: "933723574220",
  appId: "1:933723574220:web:6c37b1d93a5b03b4541769",
  measurementId: "G-6E21Y7F0ZR"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

createApp({
  setup() {
    const lastClick = ref(null); // 最後にクリックした位置
    const tempSeats = ref([]);    // クリックした座標のリスト

const getCoordinates = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = parseFloat(((e.clientX - rect.left) / rect.width * 100).toFixed(1));
  const y = parseFloat(((e.clientY - rect.top) / rect.height * 100).toFixed(1));
  
  // 画面上にマーカーを表示
  lastClick.value = { x, y };
  
  // コピー用のコード文字列を生成
  const nextId = seats.value.length + tempSeats.value.length + 1;
  const codeLine = `{ id: 'S${nextId}', name: '座席 ${nextId}', x: ${x}, y: ${y} },`;
  
  // リストの先頭に追加（新しい順に見えるように）
  tempSeats.value.unshift(codeLine);
};

// return に追加
return {
  // ...既存の変数...
  getCoordinates, lastClick, tempSeats
};

    // 【座席の座標定義】 (画像の該当箇所をクリックするとコンソールに座標が出ます)
    const seats = ref([
      { id: 'S1', name: '座席 1', x: 10, y: 10 },
      { id: 'S2', name: '座席 2', x: 20, y: 10 },
      { id: 'S3', name: '座席 3', x: 30, y: 10 },
      { id: 'S4', name: '座席 4', x: 40, y: 10 },
      { id: 'S5', name: '座席 5', x: 50, y: 10 },
      { id: 'S6', name: '座席 6', x: 60, y: 10 },
      { id: 'S7', name: '座席 7', x: 70, y: 10 },
      { id: 'S8', name: '座席 8', x: 80, y: 10 },
      { id: 'S9', name: '座席 9', x: 10, y: 20 },
      { id: 'S10', name: '座席 10', x: 20, y: 20 },
      { id: 'S11', name: '座席 11', x: 30, y: 20 },
      { id: 'S12', name: '座席 12', x: 40, y: 20 },
      { id: 'S13', name: '座席 13', x: 50, y: 20 },
      { id: 'S14', name: '座席 14', x: 60, y: 20 },
      { id: 'S15', name: '座席 15', x: 70, y: 20 },
      { id: 'S16', name: '座席 16', x: 80, y: 20 },
      { id: 'S17', name: '座席 17', x: 10, y: 30 },
      { id: 'S18', name: '座席 18', x: 20, y: 30 },
      { id: 'S19', name: '座席 19', x: 30, y: 30 },
      { id: 'S20', name: '座席 20', x: 40, y: 30 },
      { id: 'S21', name: '座席 21', x: 50, y: 30 },
      { id: 'S22', name: '座席 22', x: 60, y: 30 },
      { id: 'S23', name: '座席 23', x: 70, y: 30 },
      { id: 'S24', name: '座席 24', x: 80, y: 30 },
      { id: 'S25', name: '座席 25', x: 10, y: 40 },
      { id: 'S26', name: '座席 26', x: 20, y: 40 },
      { id: 'S27', name: '座席 27', x: 30, y: 40 },
      { id: 'S28', name: '座席 28', x: 40, y: 40 },
      { id: 'S29', name: '座席 29', x: 50, y: 40 },
      { id: 'S30', name: '座席 30', x: 60, y: 40 },
      { id: 'S31', name: '座席 31', x: 70, y: 40 },
      { id: 'S32', name: '座席 32', x: 80, y: 40 },
      { id: 'S33', name: '座席 33', x: 10, y: 50 },
      { id: 'S34', name: '座席 34', x: 20, y: 50 },
      { id: 'S35', name: '座席 35', x: 30, y: 50 },
      { id: 'S36', name: '座席 36', x: 40, y: 50 },
      { id: 'S37', name: '座席 37', x: 50, y: 50 },
      { id: 'S38', name: '座席 38', x: 60, y: 50 },
      { id: 'S39', name: '座席 39', x: 70, y: 50 },
      { id: 'S40', name: '座席 40', x: 80, y: 50 }
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
      onSnapshot(collection(db, "seat_status"), (snapshot) => {
        const newData = {};
        snapshot.forEach(doc => {
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
      const seatRef = doc(db, "seat_status", selectedSeat.value.id);
      await setDoc(seatRef, {
        category: form.category,
        name: form.name,
        notes: form.notes,
        date: getTodayStr(),
        timestamp: new Date()
      });
      closeModal();
    };

    const vacateSeat = async () => {
      if(confirm('退席しますか？')) {
        await deleteDoc(doc(db, "seat_status", selectedSeat.value.id));
        closeModal();
      }
    };

    // 開発用：画像をクリックした場所の座標を調べる機能
    const getCoordinates = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
      const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
      console.log(`{ id: 'NEW', name: '新規座席', x: ${x}, y: ${y} },`);
    };

    return {
      seats, activeSeats, selectedSeat, form,
      isOccupied, getOccupant, openModal, closeModal, saveSeat, vacateSeat, getCoordinates
    };
  }
}).mount('#app');