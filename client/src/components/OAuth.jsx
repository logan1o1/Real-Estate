import { FaGoogle, FaPlus } from "react-icons/fa";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { app } from "../firebase";
import { useDispatch } from 'react-redux'
import { signinFailure, signinSuccess } from "../redux/user/userSlice";
import { useNavigate } from "react-router-dom";

export default function OAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleGoogleClick = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const auth = getAuth(app);

      const result = await signInWithPopup(auth, provider);

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: result.user.displayName,
          email: result.user.email,
          photo: result.user.photoURL,
        }),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(signinFailure(data.message));
        return;
      }
      dispatch(signinSuccess(data));
      navigate("/")
    } catch (error) {
      dispatch(signinFailure(error.message));
      console.log("couldn't login with google", error);
    }
  };

  return (
    <button
      onClick={handleGoogleClick}
      type="button"
      className="bg-red-700 text-white rounded-lg p-2 uppercase hover:opacity-90 flex items-center justify-center gap-3"
    >
      <p className="text-center left-3">Continue with google</p>
      <div className="flex items-center gap-0">
        <FaGoogle className="text-white" />{" "}
        <FaPlus className="text-white text-sm" />
      </div>
    </button>
  );
}
