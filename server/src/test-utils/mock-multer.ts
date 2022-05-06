export function MockMulterFile(buffer: Buffer, originalname: string) {
	const mockFile: Express.Multer.File = {
		originalname,
		buffer,
	};

	return mockFile;
}
