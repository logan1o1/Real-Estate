import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signoutUserStart,
  signoutUserFailure,
  signoutUserSuccess,
} from "../redux/user/userSlice";
import { Link } from 'react-router-dom'

export default function Profile() {
  const fileRef = useRef(null);
  const dispatch = useDispatch();
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [showListingsError, setShowListingsError] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const [file, setFile] = useState(undefined);
  const [filePercent, setFilePercent] = useState(0);
  const [fileErr, setFileErr] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.id]: event.target.value });
  };

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_change",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePercent(Math.round(progress));
      },

      (error) => setFileErr(true),

      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFormData({ ...formData, profPhoto: downloadURL });
        });
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }

      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  const handleDelete = async () => {
    try {
      dispatch(deleteUserStart())
      const resp = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: "DELETE"
      });
      const data = await resp.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  }

  const handleSignout = async () => {
    try {
      dispatch(signoutUserStart());
      const resp= await fetch("/api/auth/signout");
      const data = await resp.json();
      if (data.success === false) {
        dispatch(signoutUserFailure(data.message));
        return;
      }
      dispatch(signoutUserSuccess(data))
    } catch (error) {
      dispatch(signoutUserFailure(error.message));
    }
  }

  const showListings = async () => {
    try {
      setShowListingsError(false);
      const resp = await fetch(`/api/user/listings/${currentUser._id}`);
      const data = await resp.json();
      if (data.success === false) {
        setShowListingsError(true);
        return;
      }
      setUserListings(data);
      console.log(userListings);
    } catch (error) {
      setShowListingsError(true)
    }
  }

  const handleDeleteListing = async (listId) => {
    try {
      const res = await  fetch(`/api/listing/delete/${listId}`,{
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success === false){
        alert("Failed to delete listing.");
        console.log(data.message);
        return;
      }
      setUserListings((prev) => prev.filter((list) => list._id !== listId ))
    } catch (error) {
      console.log(error.message);
    }
  }

  const handleUpdateListing = async (listId) => {}

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-center font-semibold my-7 text-3xl">User Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          onChange={(e) => setFile(e.target.files[0])}
          type="file"
          ref={fileRef}
          hidden
          accept="image/*"
        />
        <img
          onClick={() => fileRef.current.click()}
          className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-3 mb-5"
          src={formData.profPhoto || currentUser.profPhoto}
          alt="profile pic"
        />
        <p className="text-sm self-center">
          {fileErr ? (
            <span className="text-red-600">
              Image Upload Error: Must be an image file & the file must be
              smaller than 5 MB
            </span>
          ) : filePercent > 0 && filePercent < 100 ? (
            <span className="text-slate-900">{`Uploading... ${filePercent}%`}</span>
          ) : filePercent === 100 ? (
            <span className="text-green-600">Image successfuly uploaded</span>
          ) : (
            ""
          )}
        </p>
        <input
          type="text"
          placeholder="Username"
          defaultValue={currentUser.username}
          className="border p-2 rounded-lg"
          id="username"
          onChange={handleChange}
        />
        <input
          type="email"
          placeholder="Email"
          defaultValue={currentUser.email}
          className="border p-2 rounded-lg"
          id="email"
          onChange={handleChange}
        />
        <input
          type="password"
          placeholder="Password"
          defaultValue={currentUser.password}
          className="border p-2 rounded-lg"
          id="password"
          onChange={handleChange}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-slate-700 text-white p-2 rounded-lg hover:opacity-90 disabled:opacity-80 uppercase"
        >
          {loading ? "Loading..." : "Update"}
        </button>
        <Link className="bg-green-700 text-white p-2 rounded-lg hover:opacity-90 disabled:opacity-80 uppercase text-center" to="/create-listing">
          Create Listing
        </Link>
      </form>

      <div className="flex justify-between mt-3">
        <span onClick={handleDelete} className="text-red-600 cursor-pointer">Delete Account</span>
        <span onClick={handleSignout} className="text-red-600 cursor-pointer">Sign Out</span>
      </div>

      <p className={`text-sm mt-4 text-center ${ error ? 'text-red-600' : 'text-green-600'}`}>
        {error
          ? `Error: ${error}`
          : updateSuccess === true
          ? "Your profile is updated successfuly"
          : ""}
      </p>
      <button onClick={showListings} className='text-green-700 w-full'>
        Show Listings
      </button>
      <p className='text-red-700 mt-5'>
        {showListingsError ? "Error showing listings" : ""}
      </p>

      {userListings && userListings.length > 0 && (
        <div className='flex flex-col gap-4'>
          <h1 className="text-center mt-7 text-2xl font-semibold">Your Listing</h1>

          {userListings.map((list) => (
            <div
            key={list._id}
            className="border rounded-lg p-3 flex justify-between items-center gap-4"
            >
              <Link to={`/listing/${list._id}`}>
                <img src={list.imgUrls[0]} alt="listing cover" className='h-16 w-16 object-contain' />
              </Link>
              <Link
              className='text-slate-700 font-semibold  hover:underline truncate flex-1'
              to={`/listing/${list._id}`}
              >
                <p>{list.name}</p>
              </Link>

              <div className='flex flex-col item-center'>
                <button
                type="button"
                onClick={() => handleDeleteListing(list._id)}
                className='text-red-700 uppercase'
                >
                  Delete
                </button>
                <Link to={`/update-listing/${list._id}`}>
                <button type="button" className='text-green-700 uppercase'>Edit</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
