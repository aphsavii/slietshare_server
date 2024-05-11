import { Qs } from "../models/qs.modal.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/uploadOnCloudinary.js";

const uploadQs = asyncHandler(async (req, res) => {
  // check if user is authorized
  // check each required details about qs is present in req
  // upload file in cloudinary, return if failed
  // save in db, return and also delete file from cloudinary if failed;

  if (!req.user)
    return res
      .status(401)
      .json(new ApiError("Unauthorized User", 401, ["Inavalid Token"]));

  const { subCode, subName, programme, type, trade, sem, DOE } = req.body;
  const user = req.user;

  if (
    [subCode, subName, programme, trade, sem, type, DOE].some((field) => {
      let temp = field ?? "";
      return temp == "";
    })
  ) {
    return res
      .status(400)
      .json(
        new ApiError(
          "subCode, subName, programme, trade, sem and DOE are mandatory",
          400
        )
      );
  }

  let qsUrl = "";
  const modifiedSubCode = subCode.replace(/\s/g, "").toLowerCase().replaceAll('-', '').replaceAll(' ', '').replaceAll('_', '-');

  // Find if same question is already uploaded
  const alreadyUploaded = await Qs.find(
    { subCode: { $regex: new RegExp(modifiedSubCode, "i") } }
  )
  console.log(alreadyUploaded)


  if (req.files && req.files.qs && req.files.qs.length > 0) {
    let localFilePath = req.files.qs[0].path;
    const uploadUrl = await uploadOnCloudinary(localFilePath, "/qs");
    qsUrl = uploadUrl;
  }

  if (!qsUrl)
    return res.status(500).json(new ApiError("Failed to upload file", 500));


  const qs = await Qs.create({
    subCode: modifiedSubCode,
    subName,
    programme,
    trade,
    type,
    sem,
    DOE,
    qsUrl,
    ...(alreadyUploaded.length>0 && {
      status: 'pending'
    }),
    uploadedBy: user._id,
  });

  if (!qs) {
    await deleteFromCloudinary(qsUrl);
    return new ApiError("Failed to save in db", 500);
  }
  return res
    .status(201)
    .json(new ApiResponse(201, "Question paper uploaded successfully", qs));
});

// Approve Question paper
const approveQs = asyncHandler(async (req, res) => {
  if (!req.user)
    return res
      .status(401)
      .json(new ApiError("Unauthorized Request", 401, ["Invalid Token"]));
  const qsId = req.params.qsId;
  const user = req.user;
  if (user.role !== "admin")
    return res
      .status(401)
      .json(
        new ApiError("Unauthorized Request", 401, ["Admin access required"])
      );

  const qs = await Qs.findById(qsId);
  if (!qs)
    return res.status(404).json(new ApiError("Question paper not found", 404));

  qs.status = "approved";
  const updatedQs = await qs.save({ validateBeforeSave: false });

  if (!updatedQs)
    return res.status(500).json(new ApiError("Failed to update status", 500));

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Question paper approved successfully", updatedQs)
    );
});

const getQs = asyncHandler(async (req, res) => {
  if (!req.query.q || req.query.q == "")
    return res
      .status(400)
      .json(
        new ApiError("Invalid Request", 400, [
          "Invalid Query!, query is required",
        ])
      );
  const query = req?.query?.q;
  const qs = await Qs.find({
    $or: [
      { subCode: { $regex: new RegExp(query, "i") } },
      { subName: { $regex: new RegExp(query, "i") } },
    ],
    $and: [{ status: "approved" }],
  }).populate("uploadedBy", "fullName email");
  // console.log(qs);
  if (!qs)
    return res.status(404).json(new ApiError("Question papers not found", 404));
  if (qs.length == 0)
    return res.status(404).json(new ApiError("Question papers not found", 404));
  return res.status(200).json(new ApiResponse(200, "Question papers", qs));
});

const getAllPendingQs = asyncHandler(async (req, res) => {
  const qs = await Qs.find({ status: "pending" }).populate(
    "uploadedBy",
    "fullName email"
  );
  return res
    .status(200)
    .json(new ApiResponse(200, "All pending question papers", qs));
});

const deleteQs = asyncHandler(async (req, res) => {
  if (!req.user)
    return res
      .status(401)
      .json(new ApiError("Unauthorized Request", 401, ["Invalid Token"]));
  const qsId = req.params.qsId;
  const userId = req.user._id;

  const qs = await Qs.findById(qsId);
  if (!qs) return res.status(404).json(new ApiError("Question paper not found", 404));

  const uploadedBy = qs.uploadedBy._id;
  if (req.user?.role !== "admin" && userId.toString() !== uploadedBy.toString())
    return res
      .status(401)
      .json(
        new ApiError("Unauthorized Request", 401, ["You don't have permission to perform this action"])
      );
  const deleteQs = await deleteFromCloudinary(qs.qsUrl);
  if (!deleteQs)
    return res.status(500).json(new ApiError("Failed to delete", 500));
  const deletedQs = await qs.deleteOne();
  if (!deletedQs)
    return res.status(500).json(new ApiError("Failed to delete", 500));

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Question paper deleted successfully", deletedQs)
    );
});

const getQsbyUser = asyncHandler(async (req, res) => {
    if (!req.user)
     return res.status(401).json(
    new ApiError("Unauthorized request",401)
  )
  if (!req.params?.userId)
    return res
      .status(400)
      .json(
        new ApiError("Invalid Request", 400, [
          "Invalid User Id!, User Id is required",
        ])
      );

  const userRegno = +req.params?.userId;
  if (!userRegno)
    return res
      .status(400)
      .json(
        new ApiError("Invalid Request", 400, [
          "Invalid User Id!, User Id is required",
        ])
      );
      const qs = await Qs.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "uploadedBy",
            foreignField: "_id",
            as: "uploadedBy",
          },
        },
        {
          $unwind: "$uploadedBy",
        },
        {
          $match: {
            "uploadedBy.regno": userRegno,
          },
        },
        {
          $project: {
            "subCode":1,
            "subName":1,
            "programme":1,
            "trade":1,
            "sem":1,
            "DOE":1,
            "type":1,
            "status":1,
            "qsUrl":1,
            "uploadedBy.regno": 1,
            "uploadedBy.fullName": 1,
            "uploadedBy.email":1,
          },
        },
      ]);
  if (!qs)
    return res.status(404).json(new ApiError("Question papers not found", 404));
  if (qs.length == 0)
    return res.status(404).json(new ApiError("Question papers not found", 404));


  return res
    .status(200)
    .json(new ApiResponse(200, "Question papers uploaded by you", qs));
});


export { uploadQs, approveQs, getQs, getAllPendingQs, deleteQs, getQsbyUser };
