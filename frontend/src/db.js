// db.js
import { Dexie } from "dexie"
import { clear_expired_receiving_chains, clear_expired_skipped_messages, clear_expired_user_info } from "./utils/StorageUtils"

export const db_string = "messaging_clone"
export const identity_store_name = "identity"
export const double_ratchet_store_name = "dr_sessions"
export const chats_store_name = "chats"
export const otp_store_name = "one_time_prekeys"
export const dh_keystore_name = "dh_keys_prev"
export const skipped_messages_store_name = "skipped_messages"
export const file_store_name = "message_files"
export const user_info_store_name = "user_cache"
export const username_index_name = "username_index"
export const expiration_index_name = "expiration_index"
export const user_metadata_store_name = "user_metadata"
export const current_version = 2
export const max_otp = 100;

export const db = new Dexie(db_string)

db.version(current_version).stores({
    [identity_store_name]: " &user_id",
    [double_ratchet_store_name]: " &user_id",
    [chats_store_name]: " &chat_id",
    [otp_store_name]: "",
    [dh_keystore_name]: " &header_key, expiration",
    [file_store_name]: "&fileId",
    [user_metadata_store_name]: "&user_id, username",
    [user_info_store_name]: "&user_id, username, expiration",
    [skipped_messages_store_name]: "&message_id, expiration"
})

db.open()

clear_expired_receiving_chains(db)
clear_expired_user_info(db)
clear_expired_skipped_messages(db)