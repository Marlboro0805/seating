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
    // 【座席の座標定義】 (画像の該当箇所をクリックするとコンソールに座標が出ます)
    const seats = ref([
      { id: 'S1', name: '左上 机1', x: 22.5, y: 14.5 },
      { id: 'S2', name: '左側 机2(上)', x: 15.5, y: 22.0 },
      { id: 'S3', name: '左側 机2(下)', x: 16.0, y: 27.5 },
      { id: 'S4', name: '斜め机1(左)', x: 33.5, y: 15.5 },
      { id: 'S5', name: '斜め机1(右)', x: 38.5, y: 11.5 },
      { id: 'S6', name: '右奥 ソファー(上)', x: 77.5, y: 28.0 },
      { id: 'S7', name: '右奥 ソファー(下)', x: 78.0, y: 36.5 }
      // 必要に応じて追加してください
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