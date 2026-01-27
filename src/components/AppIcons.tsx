
const IMAGE_BASE = import.meta.env.VITE_IMAGE_PROXY_BASE;

const APP_DATA = [
  { ID: 6, NAME: "Google", LINK: "https://www.google.mn/", IMAGE_PATH: "uploads/image/systems/1714026429032-1714026298687.png" },
  { ID: 7, NAME: "Office 365", LINK: "https://www.office.com/", IMAGE_PATH: "uploads/image/systems/1714026494585-1714026364253.png" },
  { ID: 3, NAME: "Webmail", LINK: "https://mail.zoho.com/zm/#mail/folder/inbox", IMAGE_PATH: "uploads/image/systems/1714026386141-1714026255814.png" },
  { ID: 1, NAME: "ERP систем", LINK: "https://erp.teso.mn/", IMAGE_PATH: "uploads/image/systems/1714026186171-1714026055832.png" },
  { ID: 21, NAME: "ЗӨВ систем", LINK: "https://zuv.teso.mn/", IMAGE_PATH: "uploads/image/systems/zuv.jpg" },
  { ID: 5, NAME: "Үйлдвэрийн систем", LINK: "https://mes.teso.mn/", IMAGE_PATH: "uploads/image/systems/1702961510127-1702961489057.png" },
  { ID: 9, NAME: "TESO App", LINK: "https://surgalt.teso.mn/", IMAGE_PATH: "uploads/image/systems/1702431446076-1702431439641.jpg" },
  { ID: 4, NAME: "Файл сервер", LINK: "https://172.16.10.20/cgi-bin/", IMAGE_PATH: "uploads/image/systems/1714026358498-1714026228157.png" }
];

export default function AppIcons() {
  return (
    <div className="app-icons">
      {APP_DATA.map(app => (
        <a
          key={app.ID}
          href={app.LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="app-icon"
        >
          <img src={`${IMAGE_BASE}${app.IMAGE_PATH}`} alt={app.NAME} />
          <span>{app.NAME}</span>
        </a>
      ))}
    </div>
  );
}
