import { createApp, ref, reactive, onMounted } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: 'AIzaSyBruI9HbBfAHFBPLJueNOtcHn8cUYdynJU',
  authDomain: 'myapp-8f695.firebaseapp.com',
  projectId: 'myapp-8f695',
  storageBucket: 'myapp-8f695.firebasestorage.app',
  messagingSenderId: '933723574220',
  appId: '1:933723574220:web:6c37b1d93a5b03b4541769',
  measurementId: 'G-6E21Y7F0ZR',
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

createApp({
  setup() {
    // 40席分のデータ
    const seats = ref([
      { id: 'S1', name: '1', x: 19.2, y: 12.9 },
      { id: 'S2', name: '2', x: 30.0, y: 9.2 },
      { id: 'S3', name: '3', x: 83.4, y: 11.2 },
      { id: 'S4', name: '4', x: 90.7, y: 21.5 },
      { id: 'S5', name: '5', x: 87.0, y: 21.5 },
      { id: 'S6', name: '6', x: 83.3, y: 21.5 },
      { id: 'S7', name: '7', x: 50.0, y: 13.4 },
      { id: 'S8', name: '8', x: 43.7, y: 16.2 },
      { id: 'S9', name: '9', x: 36.3, y: 20.8 },
      { id: 'S10', name: '10', x: 55.9, y: 21.8 },
      { id: 'S11', name: '11', x: 49.6, y: 26.1 },
      { id: 'S12', name: '12', x: 42.3, y: 30.0 },
      { id: 'S13', name: '13', x: 57.9, y: 32.2 },
      { id: 'S14', name: '14', x: 52.0, y: 35.1 },
      { id: 'S15', name: '15', x: 46.4, y: 46.5 },
      { id: 'S16', name: '16', x: 54.2, y: 54.8 },
      { id: 'S17', name: '17', x: 64.6, y: 49.7 },
      { id: 'S18', name: '18', x: 11.9, y: 23.2 },
      { id: 'S19', name: '19', x: 11.4, y: 28.6 },
      { id: 'S20', name: '20', x: 11.4, y: 33.4 },
      { id: 'S21', name: '21', x: 18.9, y: 30.8 },
      { id: 'S22', name: '22', x: 11.4, y: 41.7 },
      { id: 'S23', name: '23', x: 19.2, y: 41.7 },
      { id: 'S24', name: '24', x: 19.2, y: 46.2 },
      { id: 'S25', name: '25', x: 14.4, y: 54.0 },
      { id: 'S26', name: '26', x: 13.3, y: 57.8 },
      { id: 'S27', name: '27', x: 24.3, y: 57.8 },
      { id: 'S28', name: '28', x: 12.8, y: 74.1 },
      { id: 'S29', name: '29', x: 12.8, y: 67.7 },
      { id: 'S30', name: '30', x: 23.2, y: 67.7 },
      { id: 'S31', name: '31', x: 23.2, y: 74.2 },
      { id: 'S32', name: '32', x: 68.1, y: 65.3 },
      { id: 'S33', name: '33', x: 79.2, y: 63.1 },
      { id: 'S34', name: '34', x: 79.2, y: 68.6 },
      { id: 'S35', name: '35', x: 90.0, y: 63.1 },
      { id: 'S36', name: '36', x: 90.0, y: 68.6 },
      { id: 'S37', name: '37', x: 90.0, y: 38.9 },
      { id: 'S38', name: '38', x: 90.0, y: 45.8 },
      { id: 'S39', name: '39', x: 79.2, y: 38.9 },
      { id: 'S40', name: '40', x: 79.2, y: 45.8 },
    ]);

    const activeSeats = ref({});
    const selectedSeat = ref(null);
    const form = reactive({ category: '利用者', name: '', notes: '' });
    const lastClick = ref(null);
    const tempSeats = ref([]);

    const getTodayStr = () => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    onMounted(() => {
      const today = getTodayStr();
      onSnapshot(collection(db, "seat_status"), (snapshot) => {
        const newData = {};
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.date === today) { newData[doc.id] = data; }
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

    const closeModal = () => { selectedSeat.value = null; };

    const saveSeat = async () => {
      if (!form.name) return;
      await setDoc(doc(db, "seat_status", selectedSeat.value.id), {
        category: form.category, name: form.name, notes: form.notes,
        date: getTodayStr(), timestamp: new Date()
      });
      closeModal();
    };

    const vacateSeat = async () => {
      if(confirm('退席しますか？')) {
        await deleteDoc(doc(db, "seat_status", selectedSeat.value.id));
        closeModal();
      }
    };

    const getCoordinates = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = parseFloat(((e.clientX - rect.left) / rect.width * 100).toFixed(1));
      const y = parseFloat(((e.clientY - rect.top) / rect.height * 100).toFixed(1));
      lastClick.value = { x, y };
      const nextId = seats.value.length + tempSeats.value.length + 1;
      const codeLine = `{ id: 'S${nextId}', name: '座席 ${nextId}', x: ${x}, y: ${y} },`;
      tempSeats.value.unshift(codeLine);
    };

    return {
      seats, activeSeats, selectedSeat, form, isOccupied, getOccupant, 
      openModal, closeModal, saveSeat, vacateSeat, getCoordinates, lastClick, tempSeats
    };
  }
}).mount('#app');