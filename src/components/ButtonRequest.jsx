import React, { useEffect, useState } from "react"
import Backdrop from "@mui/material/Backdrop"
import Box from "@mui/material/Box"
import Modal from "@mui/material/Modal"
import Typography from "@mui/material/Typography"
import { useSpring, animated } from "@react-spring/web"
import CloseIcon from "@mui/icons-material/Close"
import { storage, BUCKET_ID } from "../appwrite"

export default function ButtonRequest() {
	const [open, setOpen] = useState(false)
	const handleOpen = () => setOpen(true)
	const handleClose = () => setOpen(false)
	const fade = useSpring({
		opacity: open ? 1 : 0,
		config: {
			duration: 200,
		},
	})
	const [images, setImages] = useState([])

	const fetchImagesFromAppwrite = async () => {
		try {
			const response = await storage.listFiles(
				BUCKET_ID,
				[],
				100
			)

			// Filter hanya file yang ada di folder UploadImage/
			const uploadedFiles = response.files.filter(file => 
				file.name.startsWith('UploadImage/')
			)

			// Generate preview URLs dengan metadata
			const imageData = uploadedFiles.map(file => ({
				url: storage.getFilePreview(
					BUCKET_ID,
					file.$id,
					200,
					200,
					'center',
					80
				),
				timestamp: file.$createdAt
			}))

			// Sort dari yang terlama
			imageData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

			setImages(imageData)
		} catch (error) {
			console.error("Error fetching images from Appwrite Storage:", error)
		}
	}

	useEffect(() => {
		fetchImagesFromAppwrite()
	}, [])

	return (
		<div>
			<button
				onClick={handleOpen}
				className="flex items-center space-x-2 text-white px-6 py-4"
				id="SendRequest">
				<img src="/Request.png" alt="Icon" className="w-6 h-6 relative bottom-1 " />
				<span className="text-base lg:text-1xl">Request</span>
			</button>
			<Modal
				aria-labelledby="spring-modal-title"
				aria-describedby="spring-modal-description"
				open={open}
				onClose={handleClose}
				closeAfterTransition
				BackdropComponent={Backdrop}
				BackdropProps={{
					timeout: 500,
				}}>
				<animated.div style={fade}>
					<Box className="modal-container">
						<CloseIcon
							style={{ position: "absolute", top: "10px", right: "10px", cursor: "pointer", color: "grey" }}
							onClick={handleClose}
						/>
						<Typography id="spring-modal-description" sx={{ mt: 2 }}>
							<h6 className="text-center text-white text-2xl mb-5">Request</h6>
							<div className="h-[22rem] overflow-y-scroll overflow-y-scroll-no-thumb">
								{images
									.map((imageData, index) => (
										<div
											key={index}
											className="flex justify-between items-center px-5 py-2 mt-2"
											id="LayoutIsiButtonRequest">
											<img
												src={imageData.url}
												alt={`Request ${index}`}
												className="h-10 w-10 blur-sm"
											/>
											<span className="ml-2 text-white">
												{new Date(imageData.timestamp).toLocaleString()}
											</span>
										</div>
									))
									.reverse()}
							</div>
							<div className="text-white text-[0.7rem] mt-5">
								Note : Jika tidak ada gambar yang sudah anda upload silahkan reload
							</div>
						</Typography>
					</Box>
				</animated.div>
			</Modal>
		</div>
	)
}
