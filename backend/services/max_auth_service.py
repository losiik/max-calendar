import hmac
import hashlib
import json
from urllib.parse import parse_qs, unquote


def parse_init_data(init_data: str) -> dict:
    decoded = unquote(init_data)

    parsed = parse_qs(decoded, keep_blank_values=True)

    result = {k: v[0] for k, v in parsed.items()}
    return result


def verify_init_data(init_data: str, bot_token: str) -> dict:
    data_dict = parse_init_data(init_data)

    if "hash" not in data_dict:
        raise ValueError("Нет поля hash в initData")

    received_hash = data_dict.pop("hash")

    data_check_list = [f"{k}={v}" for k, v in sorted(data_dict.items())]
    data_check_string = "\n".join(data_check_list)

    secret_key = hashlib.sha256(bot_token.encode()).digest()
    hmac_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()

    if hmac_hash != received_hash:
        raise ValueError("Невалидная подпись initData")

    if "user" in data_dict:
        data_dict["user"] = json.loads(data_dict["user"])

    return data_dict


# Пример использования
if __name__ == "__main__":
    BOT_TOKEN = ""
    init_data = ""

    data = verify_init_data(init_data, BOT_TOKEN)
    print(data)
    print("User ID:", data["user"]["id"])