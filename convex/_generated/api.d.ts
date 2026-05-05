/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions_chat from "../actions/chat.js";
import type * as actions_llm from "../actions/llm.js";
import type * as finances from "../finances.js";
import type * as http from "../http.js";
import type * as messages from "../messages.js";
import type * as schedules from "../schedules.js";
import type * as tools_financeTools from "../tools/financeTools.js";
import type * as tools_index from "../tools/index.js";
import type * as tools_scheduleTools from "../tools/scheduleTools.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "actions/chat": typeof actions_chat;
  "actions/llm": typeof actions_llm;
  finances: typeof finances;
  http: typeof http;
  messages: typeof messages;
  schedules: typeof schedules;
  "tools/financeTools": typeof tools_financeTools;
  "tools/index": typeof tools_index;
  "tools/scheduleTools": typeof tools_scheduleTools;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
