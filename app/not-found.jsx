'use client';
import './not-found.css';
import Video from './Component/Video/Video';

export default function NotFound() {
  const imageError = '/imges/imageError.png';

  return (
    <div className="notfound-container">
      <div className="overlay"></div>
      <div className="content">
        <p className="back-home">
          <a href="/">חזור לדף הבית</a>
        </p>
      </div>
      <Video srcVideo={"/videos/no-found.mp4"} />
      {/* <img src={imageError} alt="404 Not Found" className="error-image" /> */}
    </div>
  );
}
