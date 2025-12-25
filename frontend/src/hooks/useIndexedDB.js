import { openDB } from "idb"
import { useState, useEffect } from "react"
import { clear_expired_receiving_chains, clear_expired_user_info, clear_expired_skipped_messages } from "../utils/StorageUtils"
import { db } from "../db"

export function useIndexedDB() {
    let [db_object, setDB] = useState(null)

    useEffect(() => {
        db.open()
        const open = async () => {

            db_obj = await openDB(db_string, current_version, {
                upgrade(db_obj, oldVersion, newVersion, transaction) {
                    const identity_store = db_obj.createObjectStore(identity_store_name, { keyPath: "user_id" });
                    const dr_sess_store = db_obj.createObjectStore(double_ratchet_store_name, { keyPath: "user_id" });
                    const chat_store = db_obj.createObjectStore(chats_store_name, { keyPath: "chat_id" });
                    const otp_store = db_obj.createObjectStore(otp_store_name);
                    const dh_key_store = db_obj.createObjectStore(dh_keystore_name, { keyPath: "header_key" })
                    dh_key_store.createIndex(expiration_index_name, "expiration")
                    const file_store = db_obj.createObjectStore(file_store_name)
                    const metadata_store = db_obj.createObjectStore(user_metadata_store_name)
                    const user_info_cache = db_obj.createObjectStore(user_info_store_name, { keyPath: "user_id" })
                    user_info_cache.createIndex(username_index_name, "username")
                    user_info_cache.createIndex(expiration_index_name, "expiration")
                    const skipped_message_store = db_obj.createObjectStore(skipped_messages_store_name, { keyPath: "message_id" })
                    skipped_message_store.createIndex(expiration_index_name, "expiration")

                    clear_expired_receiving_chains(db_obj)
                    clear_expired_user_info(db_obj)
                    clear_expired_skipped_messages(db_obj)
                }
            })
            setLoading(false);
            setDB(db_obj)
        }
        open()
        return () => {
            db_obj && db_obj.close()
        }
    }, [])

    return { db: db_obj, loading }
}