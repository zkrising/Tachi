import React from "react";
import Async from "react-async";
import Loading from "./Loading";

export default function AsyncLoader<T = unknown>({
	promiseFn,
	promise,
	children,
}: {
	promiseFn?: () => Promise<T>;
	promise?: Promise<T>;
	children: (data: T) => JSX.Element | null | string | (JSX.Element | string)[];
}) {
	const Component = children;
	return (
		<Async promiseFn={promiseFn} promise={promise}>
			<Async.Pending>
				<Loading />
			</Async.Pending>
			<Async.Rejected>
				{error => (
					<div className="text-center">
						Fatal Error: {error.message}. That&apos;s not good!
					</div>
				)}
			</Async.Rejected>
			{/* @ts-expect-error come on */}
			<Async.Fulfilled>{data => Component(data)}</Async.Fulfilled>
		</Async>
	);
}
