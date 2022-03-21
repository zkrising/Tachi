import { SlashCommandBuilder } from "@discordjs/builders";
import { Util } from "discord.js";
import { escapeRegExp } from "lodash";
import db from "../../database/mongo";
import { GetQuoteWithID } from "../../database/queries";
import { GetUserInfo } from "../../utils/api-requests";
import { CreateEmbed } from "../../utils/embeds";
import { FormatDate, IsAdmin, Pluralise, TruncateString } from "../../utils/misc";
import { SlashCommand } from "../types";

const command: SlashCommand = {
	info: new SlashCommandBuilder()
		.setName("quote")
		.setDescription("Interact with the quote database.")
		.addSubcommand((sub) =>
			sub
				.setName("read")
				.setDescription("Read a quote.")
				.addStringOption((str) =>
					str.setName("name").setDescription("The quote to retrieve.").setRequired(true)
				)
		)
		.addSubcommand((sub) =>
			sub
				.setName("write")
				.setDescription("Write a quote.")
				.addStringOption((str) =>
					str.setName("name").setDescription("The name for this quote.").setRequired(true)
				)
				.addStringOption((str) =>
					str
						.setName("text")
						.setDescription("The content for this quote.")
						.setRequired(true)
				)
		)
		.addSubcommand((sub) =>
			sub
				.setName("delete")
				.setDescription("Delete a quote (Admin only).")
				.addStringOption((str) =>
					str.setName("name").setDescription("The quote to delete.").setRequired(true)
				)
		)
		.addSubcommand((sub) =>
			sub
				.setName("search_text")
				.setDescription("Search for quotes by their text.")
				.addStringOption((str) =>
					str.setName("query").setDescription("What to search for.").setRequired(true)
				)
		)
		.addSubcommand((sub) =>
			sub
				.setName("search_id")
				.setDescription("Search for quotes by their id.")
				.addStringOption((str) =>
					str.setName("query").setDescription("What to search for.").setRequired(true)
				)
		)
		.toJSON(),
	exec: async (interaction, requestingUser) => {
		const subCommand = interaction.options.getSubcommand() as
			| "read"
			| "write"
			| "delete"
			| "search_text"
			| "search_id";

		if (subCommand === "search_id" || subCommand === "search_text") {
			const query = interaction.options.getString("query", true).trim();

			if (!/^[a-z0-9]{3,20}$/u.test(query)) {
				return `This query is invalid. It must be all lowercase characters (or numbers), and between 3 and 20 characters.`;
			}

			let quotes;

			if (subCommand === "search_id") {
				quotes = await db.quotes.find(
					{
						quoteID: new RegExp(escapeRegExp(query), "iu"),
					},
					{
						sort: { hits: -1 },
						limit: 10,
					}
				);
			} else {
				quotes = await db.quotes.find(
					{
						text: new RegExp(escapeRegExp(query), "iu"),
					},
					{
						sort: { hits: -1 },
						limit: 10,
					}
				);
			}

			if (quotes.length === 0) {
				return `Couldn't find any quotes that matched this query.`;
			}

			return CreateEmbed()
				.setTitle(`Searched quotes for '${query}'`)
				.setDescription(`Found ${quotes.length} ${Pluralise(quotes.length, "quote")}.`)
				.addFields(
					quotes.map((q) => ({
						name: q.quoteID,
						value: TruncateString(q.text, 140),
					}))
				);
		}

		const quoteID = interaction.options.getString("name", true).trim();

		if (!/^[a-z0-9]{3,20}$/u.test(quoteID)) {
			return `This quote name is invalid. It must be all lowercase characters (or numbers), and between 3 and 20 characters.`;
		}

		const quote = await GetQuoteWithID(quoteID);

		if (subCommand === "read") {
			if (!quote) {
				return `No quote exists for '${Util.escapeMarkdown(quoteID)}'.`;
			}

			await db.quotes.update({ quoteID }, { $inc: { hits: 1 } });

			const authorInfo = await GetUserInfo(quote.quotedBy);

			return CreateEmbed()
				.setTitle(`Quote: ${quoteID}`)
				.setDescription(`\`\`\`${Util.escapeMarkdown(quote.text)}\`\`\``)
				.setFooter({
					text: `Quoted by ${authorInfo.username} on ${FormatDate(
						quote.quotedAt
					)}. This quote has been read ${quote.hits + 1} times.`,
				});
		} else if (subCommand === "write") {
			const text = interaction.options.getString("text", true);

			if (quote) {
				return `A quote exists for '${Util.escapeMarkdown(quoteID)}' already.`;
			}

			if (text.length > 480) {
				return `Quotes are capped at 480 characters. Not quoting this.`;
			}

			await db.quotes.insert({
				quoteID,
				text,
				hits: 0,
				quotedAt: Date.now(),
				quotedBy: requestingUser.userID,
			});

			return `Quote '${Util.escapeMarkdown(quoteID)}' has been saved.`;
		} else if (subCommand === "delete") {
			if (!IsAdmin(requestingUser.discordID)) {
				return `You are not authorised to delete quotes.`;
			}

			if (!quote) {
				return `No quote exists for '${Util.escapeMarkdown(quoteID)}'.`;
			}

			await db.quotes.remove({ quoteID: quote.quoteID });

			return `Quote '${Util.escapeMarkdown(quoteID)}' has been deleted.`;
		}

		throw new Error(`Unknown subcommand '${subCommand}'. How did this happen?`);
	},
};

export default command;
