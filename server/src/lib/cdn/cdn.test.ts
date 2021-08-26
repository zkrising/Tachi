import t from "tap";
import { CDNDelete, CDNRedirect, CDNRetrieve, CDNStore, CDNStoreOrOverwrite } from "./cdn";
import fs from "fs";
import { ServerConfig } from "lib/setup/config";
import path from "path";
import { CloseAllConnections } from "test-utils/close-connections";
import expressRequestMock from "express-request-mock";

const CDN_FILE_ROOT = ServerConfig.CDN_FILE_ROOT;

function getTestTxt() {
	return fs.readFileSync(path.join(CDN_FILE_ROOT, "test.txt"), "utf-8");
}

const ResetFileRoot = () => {
	if (process.env.NODE_ENV !== "test") {
		throw new Error(
			`Not in test, yet CDN.test.ts was triggered, which could rm -rf something important.`
		);
	}

	if (CDN_FILE_ROOT !== "./local-cdn") {
		throw new Error(
			`Unexpected CDN_FILE_ROOT of ${CDN_FILE_ROOT}. This is a security precaution, so that tests do not unexpectedly rm -rf important directories.`
		);
	}

	// isn't this terrifyingly risky?
	fs.rmSync(CDN_FILE_ROOT, { recursive: true, force: true });
};

t.test("#CDNStore", (t) => {
	t.beforeEach(ResetFileRoot);

	t.test("Should store a value.", async (t) => {
		await CDNStore("test.txt", "hello world");

		const data = fs.readFileSync(path.join(CDN_FILE_ROOT, "test.txt"), "utf8");

		t.equal(data, "hello world", "Should store the data at the CDN_FILE_ROOT.");

		t.end();
	});

	t.test("Should generate paths on the way to the file if they do not exist.", async (t) => {
		await CDNStore("a/b/c/d/e/f/g.txt", "hello");

		const data = fs.readFileSync(path.join(CDN_FILE_ROOT, "a/b/c/d/e/f/g.txt"), "utf8");

		t.equal(data, "hello", "Should store the data at the deeply nested location.");

		t.end();
	});

	t.test("Should not overwrite files.", async (t) => {
		await CDNStore("test.txt", "1");
		t.rejects(
			() => CDNStore("test.txt", "2"),
			"Should reject an overwrite to an existing file."
		);

		const data = getTestTxt();

		t.equal(data, "1", "Should not have been overwrote.");
		t.end();
	});

	t.end();
});

t.test("#CDNDelete", (t) => {
	t.beforeEach(ResetFileRoot);

	t.test("Should delete the file at the given location.", async (t) => {
		await CDNStore("test.txt", "1");

		const data = getTestTxt();

		t.equal(data, "1");

		await CDNDelete("test.txt");

		t.not(fs.existsSync(path.join(CDN_FILE_ROOT, "test.txt")), "File should not exist.");

		t.end();
	});

	t.end();
});

t.test("#CDNRetrieve", (t) => {
	t.beforeEach(ResetFileRoot);

	t.test("Should retrieve the file at the given location.", async (t) => {
		await CDNStore("test.txt", "1");

		const data = await CDNRetrieve("test.txt");

		t.equal(data.toString(), "1", "Should contain the contents of test.txt");

		t.end();
	});

	t.test("Should throw if the file does not exist.", (t) => {
		t.rejects(() => CDNRetrieve("fake-file.txt"));

		t.end();
	});

	t.end();
});

t.test("#CDNStoreOrOverwrite", (t) => {
	t.beforeEach(ResetFileRoot);

	t.test("Should store a file if one doesn't exist", async (t) => {
		await CDNStoreOrOverwrite("test.txt", "1");

		t.equal(getTestTxt(), "1");

		t.end();
	});

	t.test("Should overwrite the file if it exists.", async (t) => {
		await CDNStoreOrOverwrite("test.txt", "1");
		t.equal(getTestTxt(), "1");

		await CDNStoreOrOverwrite("test.txt", "2");
		t.equal(getTestTxt(), "2");

		t.end();
	});

	t.end();
});

t.test("#CDNRedirect", (t) => {
	t.beforeEach(ResetFileRoot);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const mockMW = (req: any, res: any) => CDNRedirect(res, "/test.txt");

	t.test("Should redirect a user to the CDN Url", async (t) => {
		const { res } = await expressRequestMock(mockMW, {});

		t.equal(res.statusCode, 302);
		t.equal(res._getRedirectUrl(), "/cdn/test.txt");

		t.end();
	});

	t.end();
});

t.teardown(CloseAllConnections);
