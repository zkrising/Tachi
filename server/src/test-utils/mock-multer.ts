export function MockMulterFile(buffer: Buffer, originalname: string) {
	return {
		originalname,
		buffer,
	} as Express.Multer.File;
}
