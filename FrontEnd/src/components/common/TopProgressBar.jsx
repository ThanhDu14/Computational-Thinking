import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

NProgress.configure({ showSpinner: false, speed: 400, minimum: 0.1 });

const TopProgressBar = () => {
  const location = useLocation();

  useEffect(() => {
    NProgress.start();
    const timer = setTimeout(() => {
      NProgress.done();
    }, 400); // give it a little time to show the bar

    return () => {
      clearTimeout(timer);
      NProgress.start(); // when unmounting/changing path, start it again to give feeling of transition
    };
  }, [location.pathname]);

  return null;
};

export default TopProgressBar;
