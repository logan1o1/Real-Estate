import React, { useState } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function CreateListing() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    imgUrls: [],
    name: "",
    desc: "",
    address: "",
    type: "rent",
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 100,
    discountPrice: 0,
    offer: false,
    furnished: false,
    parking: false,
  });
  const [imgUpldErr, setImgUpldErr] = useState(false);
  

  const handleChange = (event) => {
    if (event.target.id === "sale" || event.target.id === "rent") {
      setFormData({ ...formData, type: event.target.id });
    }

    if (
      event.target.id === "parking" ||
      event.target.id === "furnished" ||
      event.target.id === "offer"
    ) {
      setFormData({ ...formData, [event.target.id]: event.target.checked });
    }

    if (
      event.target.type === "number" ||
      event.target.type === "text" ||
      event.target.type === "textarea"
    ) {
      setFormData({ ...formData, [event.target.id]: event.target.value });
    }
  };

  const handleImgUpload = () => {
    if (files.length > 0 && files.length + formData.imgUrls.length < 7) {
      setUploading(true);
      setImgUpldErr(false);
      const promises = [];

      for (let i = 0; i < files.length; i++) {
        promises.push(storeImg(files[i]));
      }
      Promise.all(promises)
        .then((urls) => {
          setFormData({ ...formData, imgUrls: formData.imgUrls.concat(urls) });
          setUploading(false);
        })
        .catch((err) => {
          setImgUpldErr("Upload failed (2 mb max for img)");
          setUploading(false);
        });
    } else {
      setImgUpldErr("You can only upload 6 images per listing");
      setUploading(false);
    }
  };

  const storeImg = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };

  const handleRemoveImg = (index) => {
    setFormData({
      ...formData,
      imgUrls: formData.imgUrls.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.imgUrls.length < 1)
        return setError("You are required to upload images before submission");
      if (+formData.regularPrice < +formData.discountPrice)
        return setError(
          "Your regular price must be less than your discounted price"
        );
      setLoading(true);
      setError(false);

      const res = await fetch("/api/listing/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userRef: currentUser._id,
        }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success === false) {
        setError(data.message);
      }
      navigate(`/listing/${data._id}`)
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <main className="max-w-4xl p-3 mx-auto">
      <h1 className="text-3xl font-semibold text-center my-6">
        List your Estate
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col gap-3 flex-1">
          <input
            type="text"
            placeholder="Name"
            className="border p-2 rounded-lg"
            id="name"
            maxLength="50"
            minLength="10"
            required
            onChange={handleChange}
            value={formData.name}
          />
          <textarea
            type="text"
            placeholder="Description"
            className="border p-2 rounded-lg"
            id="desc"
            required
            onChange={handleChange}
            value={formData.desc}
          />
          <input
            type="text"
            placeholder="Address"
            className="border p-2 rounded-lg"
            id="address"
            required
            onChange={handleChange}
            value={formData.address}
          />
          <div className="flex gap-4 flex-wrap">
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="sale"
                onChange={handleChange}
                checked={formData.type === "sale"}
                className="w-5"
              />
              <span className="">Sell</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="rent"
                onChange={handleChange}
                checked={formData.type === "rent"}
                className="w-5"
              />
              <span className="">Rent</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="parking"
                onChange={handleChange}
                checked={formData.parking}
                className="w-5"
              />
              <span className="">Parking Spot</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="furnished"
                onChange={handleChange}
                checked={formData.furnished}
                className="w-5"
              />
              <span className="">Furnished</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="offer"
                onChange={handleChange}
                checked={formData.offer}
                className="w-5"
              />
              <span className="">Offer</span>
            </div>
          </div>
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bedrooms"
                min="1"
                max="10"
                required
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleChange}
                value={formData.bedrooms}
              />
              <span>Beds</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bathrooms"
                min="1"
                max="5"
                required
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleChange}
                value={formData.bathrooms}
              />
              <span>Baths</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="regularPrice"
                min="100"
                required
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleChange}
                value={formData.regularPrice}
              />
              <div className="flex flex-col items-center">
                <span>Regular price</span>
                {formData.type === "sale" ? (
                  <span className="text-xs">($)</span>
                ) : (
                  <span className="text-xs">($ / month)</span>
                )}
              </div>
            </div>
            {formData.offer === false ? (
              <></>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  id="discountPrice"
                  min="90"
                  required
                  className="p-3 border border-gray-300 rounded-lg"
                  onChange={handleChange}
                  value={formData.discountPrice}
                />
                <div className="flex flex-col items-center">
                  <span>Discounted price</span>
                  {formData.type === "sale" ? (
                    <span className="text-xs">($)</span>
                  ) : (
                    <span className="text-xs">($ / month)</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-3 flex-1">
          <p className="font-semibold ">
            Images:
            <span className="font-normal text-gray-600">
              The first image will be the cover (max 6)
            </span>
          </p>
          <div className="flex gap-3">
            <input
              onChange={(e) => setFiles(e.target.files)}
              className="p-3 border border-gray-400 rounded"
              type="file"
              id="images"
              accept="image/*"
              multiple
            />
            <button
              type="button"
              disabled={uploading}
              onClick={handleImgUpload}
              className="p-3 border text-green-600 border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80"
            >
              upload
            </button>
          </div>
          <p className="text-red-700 text-sm">{imgUpldErr && imgUpldErr}</p>
          {formData.imgUrls.length > 0 &&
            formData.imgUrls.map((url, index) => (
              <div
                key={url}
                className="flex justify-between p-3 border items-center"
              >
                <img
                  src={url}
                  alt="listing img"
                  className="w-20 h-20 object-contain rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImg(index)}
                  className="p-3 text-red-700 rounded-lg uppercase hover:opacity-75"
                >
                  Delete
                </button>
              </div>
            ))}
          <button
            disabled={loading || uploading}
            type="submit"
            className="bg-slate-700 text-white p-2 rounded-lg hover:opacity-90 disabled:opacity-80 uppercase"
          >
            {loading ? "Creating..." : "create listing"}
          </button>
          {error && <p className="text-red-700 text-sm">{error}</p>}
        </div>
      </form>
    </main>
  );
}
