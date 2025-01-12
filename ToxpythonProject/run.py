def convert_tox_history(file_path):
    with open(file_path, "rb") as file:
        data = file.read()
        try:
            print(data.decode('utf-8', errors='ignore'))
        except UnicodeDecodeError:
            print("Error decoding the file.")

convert_tox_history("project.ini")
