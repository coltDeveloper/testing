import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchBooks,
  addBook,
  updateBook,
  deleteBook,
  setPageNumber,
} from "../../../redux/booksSlice";
import LibraryModal from "../../../modals/admin/LibraryModal";
import { Toaster, toast } from "react-hot-toast";
import { Pencil, Trash2, Eye } from "lucide-react";
import { useForm } from "react-hook-form";
import { useUserContext } from "../../../ContextAPI/useUserContext";
import { renderStars, uploadDocuments, uploadImage, uploadVideos } from "../../../utils";

const Books = () => {
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const dispatch = useDispatch();
  const { books = [], loading, error } = useSelector((state) => state.books);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [uploadType, setUploadType] = useState("");
  const [currentBookId, setCurrentBookId] = useState(null);
  const [currentBookData, setCurrentBookData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const totalCount = useSelector((state) => state.books.totalCount);
  const pageSize = useSelector((state) => state.books.pageSize);
  const pageNumber = useSelector((state) => state.books.pageNumber);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState(null);
  const { userData } = useUserContext();

  useEffect(() => {
    dispatch(fetchBooks({ pageNumber, pageSize }));
  }, [dispatch, pageNumber, pageSize]);

  const onSubmit = async (data, coverImage, book) => {
    let coverImageUrl = null,
      bookUrl = null;
    if (coverImage) {
      coverImageUrl = await uploadImage(coverImage);
    } else if (isEdit) {
      coverImageUrl = currentBookData.coverImageUrl;
    }
    
    if (book) {
      if (data.format === "Video" || data.form === "Audio") {
        bookUrl = (await uploadVideos([book]))?.[0];
      } else {
        bookUrl = (await uploadDocuments([book]))?.[0];
      }
    } else if (isEdit) {
      bookUrl = currentBookData.bookUrl;
    }

    const payload = {
      bookName: data.bookName,
      author: data.author,
      pages: data.Pages || 0,
      rating: data.rating || 0,
      reviewCount: data.reviewCount || 0,
      detail: data.detail,
      category: data.category,
      format: data.format,
      coverImage: coverImageUrl,
      uploadBook: bookUrl,
      publicationDate: data.publicationDate,
      ...(data.format === 'Audio' && { audioDuration: data.audioDuration || null }),
      uploadedBy: userData?.userId,
    };
    if (isEdit) {
      dispatch(updateBook({ id: currentBookId, updatedBook: payload }));
    } else {
      dispatch(addBook(payload));
    }

    reset();
    setIsModalOpen(false);
    handleModalClose();
  };

  const handleEdit = (book) => {
    setCurrentBookData(book);
    setCurrentBookId(book.id);
    setIsEdit(true);
    setIsModalOpen(true);

    // Populate fields
    setValue("bookName", book.bookName || "");
    setValue("author", book.author || "");
    setValue("detail", book.detail || "");
    setValue("format", book.format || "");
    setValue("category", book.category || "");
    setValue("pages", book.pages || 0);
    setValue("CoverImage", book.coverImageUrl);
    setValue("UploadBooK", book.bookUrl);
    setValue("audioDuration", book.audioDuration || 0);
    setValue(
      "publicationDate",
      book.publicationDate
        ? new Date(book.publicationDate).toISOString().split("T")[0]
        : ""
    );
  };
  const handleBulkUpload = (file) => {
    const formData = new FormData();
    formData.append("file", file);

    // Dispatch action to upload the bulk file
    // dispatch(addParentBulk(formData))
    //   .then(() => toast.success("Bulk upload successful!"))
    //   .catch(() => toast.error("Bulk upload failed!"));
  };

  const handleModalClose = () => {
    setUploadType(""); // Reset the dropdown value
    setIsEdit(false);
  };

  const handleUploadTypeChange = (type) => {
    setUploadType(type);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    dispatch(deleteBook(id))
      .unwrap()
      .then(() => toast.success("Book deleted successfully!"))
      .catch((err) => toast.error("Failed to delete book: " + err));
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    dispatch(fetchBooks({ pageNumber: 1, pageSize }));
  };

  const handlePageChange = (newPage) => {
    if (newPage !== pageNumber) {
      dispatch(setPageNumber(newPage)); // Only set the page number in the Redux store
    }
  };

  const handleCoverClick = (coverUrl) => {
    setCoverPreviewUrl(coverUrl);
  };

  const closeCoverPreview = () => {
    setCoverPreviewUrl(null);
  };

  const filteredBooks = books.filter(
    (book) =>
      book.bookName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const booksToDisplay = filteredBooks;
  const totalPages = Math.ceil(totalCount / pageSize);
  const currentBooks = booksToDisplay;

  return (
    <div className="">
      <Toaster />
      <div className="mb-4 flex flex-wrap justify-between space-x-4">
        {/* Search Input - 2/3 Width */}
        <div className="flex-grow sm:flex-[3_3_0%]">
          <input
            type="text"
            placeholder="Search by title or author"
            className="w-full p-2 border rounded"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        {/* Dropdown - 1/3 Width */}
        <div className="flex-grow sm:flex-[1_1_0%]">
          <select
            className="w-full bg-[#241763] text-white p-2 rounded"
            onChange={(e) => handleUploadTypeChange(e.target.value)}
            value={uploadType}
          >
            <option value="" disabled>
              Add Book
            </option>
            <option value="single">Add Book</option>
            <option value="bulk">Bulk Upload Book</option>
          </select>
        </div>
      </div>

      <LibraryModal
        isModalOpen={isModalOpen}
        isEdit={isEdit}
        onSubmit={onSubmit}
        register={register}
        watch={watch}
        reset={reset}
        setValue={setValue}
        handleSubmit={handleSubmit}
        setIsModalOpen={setIsModalOpen}
        currentCover={isEdit ? currentBookData.coverImageUrl : null}
        handleBulkUpload={handleBulkUpload}
        uploadType={uploadType}
        onModalClose={handleModalClose}
      />

      <div className="overflow-x-auto overflow-visible mt-6">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-[#241763]"></div>
            <span className="ml-2 text-[#241763]">Loading...</span>
          </div>
        ) : (
          <table className="table-auto w-full">
            <thead className="py-4 border-b font-bold">
              <tr>
                <th>Cover</th>
                <th>Title</th>
                <th>Author</th>
                <th>Book</th>
                <th>Pages</th>
                <th>Rating</th>
                <th>Reviews</th>
                <th>Format</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {currentBooks.length > 0 ? (
                currentBooks.map((book) => (
                  <tr
                    key={book.book?.id}
                    className="p-2 py-2 hover:bg-gray-200"
                  >
                    <td>
                      <img
                        src={book.coverImageUrl}
                        alt="Book Cover"
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded cursor-pointer"
                        onClick={() => handleCoverClick(book.coverImageUrl)}
                      />
                    </td>
                    <td>{book.bookName}</td>
                    <td>{book.author}</td>
                    <td className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          window.open(
                            book.bookUrl,
                            "_blank",
                            "noopener,noreferrer"
                          )
                        }
                        className="p-2 hover:bg-gray-200 rounded"
                        title="View Book"
                      >
                        <Eye className="w-6 h-6 text-[#241763]" />
                      </button>
                    </td>

                    <td>{book.pages}</td>
                    <td>
                      <div className="flex items-center">
                        {renderStars(book.rating)}
                      </div>
                    </td>
                    <td>{book.reviewCount}</td>
                    <td>{book.format}</td>
                    <td className="space-x-2 flex items-center py-2">
                      <button
                        className="bg-[#B6A5C9]/50 text-white p-2 rounded mr-2 hover:bg-[#241763]/60 group"
                        onClick={() => handleEdit(book)}
                      >
                        <Pencil className="text-[#241763] w-4 h-4 group-hover:text-white" />
                      </button>
                      <button
                        className="bg-[#B6A5C9]/50 text-white p-2 rounded hover:bg-[#241763]/60 group"
                        onClick={() => handleDelete(book.id)}
                      >
                        <Trash2 className="text-[#241763] w-4 h-4 group-hover:text-white" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    No books found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => handlePageChange((prev) => Math.max(prev - 1, 1))}
            className="px-3 py-1 bg-[#241763] text-white rounded"
            disabled={pageNumber === 1}
          >
            Previous
          </button>

          <div className="flex">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                className={`px-3 py-1 mx-1 ${
                  pageNumber === i + 1
                    ? "bg-[#241763] text-white"
                    : "bg-gray-200 text-gray-700"
                } rounded`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() =>
              handlePageChange((prev) => Math.min(prev + 1, totalPages))
            }
            className="px-3 py-1 bg-[#241763] text-white rounded"
            disabled={pageNumber === totalPages}
          >
            Next
          </button>
        </div>
      </div>
      {coverPreviewUrl && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          onClick={closeCoverPreview}
        >
          <div
            className="rounded shadow-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={coverPreviewUrl}
              alt="Book Cover Preview"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Books;
