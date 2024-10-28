import { personIcon } from "./constants.js";
import getIcon, { getStatus } from "./helpers.js";
import ui from "./ui.js";

//*! Globalde Değişkenler
//! Haritada tıklanan son konum
let map;
let clickedCoords;
let layer;
let notes = JSON.parse(localStorage.getItem("notes")) || [];

/*
 *Kullanıcıya konumunu paylaşmak istiyor mu soracağız:
 *1 Paylaşırsa haritayı kullanıcının konumuna göre ayarlayacağız.
 *2 Paylaşmazsa haritayı İzmir'e ayarlayacağız. 
 */

 //! getCurrentPosition konumu elde etmemizi sağlar, navigator ve geolocation ile de konumu elde edebiliriz. console iç içedirler.
window.navigator.geolocation.getCurrentPosition(
  (e) => {
    loadMap([e.coords.latitude, e.coords.longitude], "Mevcut Konum");
  },
  () => {
    loadMap([51.50770510679978, -0.13730421738613152], "Varsayılan Konum");
  }
);

//! Haritayı yükler:
function loadMap(currentPosition, msg) {
    //!1 Harita Kurulumu / Merkez belirleme 
  map = L.map("map", {
    zoomControl: false,
  }).setView(currentPosition, 8);

    //! Sağ aşağıya zoom butonları ekleme
  L.control
    .zoom({
      position: "bottomright",
    })
    .addTo(map);

  //! 2 Haritayı ekrana basar,
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  //! Haritanın üzerine imleçleri ekleyeceğimiz bir katman oluştur
  layer = L.layerGroup().addTo(map);

   //! 3 İmleç Ekle
  L.marker(currentPosition, { icon: personIcon })
    .addTo(map)
    .bindPopup(msg);

  //! 4 Haritada tıklanma olaylarını izle
  map.on("click", onMapClick);

  //! 5 Ekrana daha önce eklenen notları bas
  renderNotes();
  renderMakers();
}

//! Haritaya tıklanma olayında:
function onMapClick(e) {
   //! Tıklanma konumu koordinatlarını global değişkene aktar
  clickedCoords = [e.latlng.lat, e.latlng.lng];

  //! Aside elementine add class'ını ekle
  ui.aside.className = "add";
}

//! İptal butonuna tıklanınca:
ui.cancelBtn.addEventListener("click", () => {
  //! Aside elementinden add class'ını kaldır
  ui.aside.className = "";
});

//! Form gönderilince:
ui.form.addEventListener("submit", (e) => {
  //! Sayfa yenilenmesini engelle
  e.preventDefault();

  //! Inputlardaki verilere eriş
  const title = e.target[0].value;
  const date = e.target[1].value;
  const status = e.target[2].value;

  //! Yeni bir nesne oluştur
  const newNote = {
    id: new Date().getTime(),
    title,
    date,
    status,
    coords: clickedCoords,
  };

  //! Nesneyi global değişkene kaydet
  notes.unshift(newNote);

  //! Localstorage'ı güncelle
  localStorage.setItem("notes", JSON.stringify(notes));

  //! Aside alanından "add" classını kaldır
  ui.aside.className = "";

  //! Formu temizle
  e.target.reset();

  //! Yeni notun ekrana gelmesi için notları tekrardan Render et
  renderNotes();
  renderMakers();
});

//! Ekrana imleçleri bas:
function renderMakers() {
  //! eski imleçleri kaldır 
  layer.clearLayers();

  notes.forEach((item) => {
    //! item'ın status'üne bağlı iconu belirle
    const icon = getIcon(item.status);

    L.marker(item.coords, { icon }) // imleci oluştur
      .addTo(layer) // imleçler katmanına ekle
      .bindPopup(item.title); // imlece bir popup ekle
  });
}

//! Ekrana notları bas:
function renderNotes() {
  const noteCards = notes
    .map((item) => {
      //! Tarihi kullanıcı dostu bir formata çevir
      const date = new Date(item.date).toLocaleString("tr", {
        day: "2-digit",
        month: "long",
        year: "2-digit",
      });

      //! Status değerini çevir
      const status = getStatus(item.status);

      //! Oluşturulcak note'un html içeriğini belirle
      return `
        <li>
            <div>
              <p>${item.title}</p>
              <p>${date}</p>
              <p>${status}</p>
            </div>

            <div class="icons">
              <i data-id="${item.id}" class="bi bi-airplane-fill" id="fly"></i>
              
              <i data-id="${item.id}" class="bi bi-trash3-fill" id="delete" ></i>
            </div>
          </li>
  `;
    })
    .join("");

  //! Note'ları liste alanında Renderla
  ui.list.innerHTML = noteCards;

  //! Delete iconlarını al ve tıklanınca silme fonksiyonunu çağır
  document.querySelectorAll("li #delete").forEach((btn) => {
    btn.addEventListener("click", () => deleteNote(btn.dataset.id));
  });

  //! Fly iconlarını al ve tıklanınca uçuş fonksiyonunu çağır
  document.querySelectorAll("li #fly").forEach((btn) => {
    btn.addEventListener("click", () => flyToLocation(btn.dataset.id));
  });
}

//! Silme butonuna tıklanınca
function deleteNote(id) {
  //! Kullanıcya sor
  const res = confirm("Notu silmeyi onaylıyor musunuz ?");

  //! Onaylarsa sil
  if (res) {
    //! ID'sini bildiğimiz elemanı diziden kaldır
    notes = notes.filter((note) => note.id !== +id);

    //! Local-storage'ı güncelle
    localStorage.setItem("notes", JSON.stringify(notes));

    //! güncel notları ekrana bas
    renderNotes();

    //! güncel imleçleri ekrana bas
    renderMakers();
  }
}

//! uçuş butonuna tıklanınca
function flyToLocation(id) {
  //! ID'si bilenen elamanı dizide bul
  const note = notes.find((note) => note.id === +id);

  //! note'un kordinatlarına uç
  map.flyTo(note.coords, 12);
}

//! tıklanma olayında:
//! Aside alanındaki form veya liste içeriğini gizlemek için hide class'ı ekle
ui.arrow.addEventListener("click", () => {
  ui.aside.classList.toggle("hide");
});