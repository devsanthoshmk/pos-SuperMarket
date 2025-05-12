import eel
import csv
import json
import os
import platform
import subprocess
import io
import builtins
import sys

# keep reference to the real open
_original_open = builtins.open


def resource_path(relative_path: str) -> str:
    """
    Returns the absolute path to a resource, whether we're running
    in a PyInstaller bundle or in normal script mode.
    """
    try:
        base_path = sys._MEIPASS
    except AttributeError:
        base_path = os.path.abspath(".")
    return os.path.join(base_path, relative_path)


def custom_open(file, mode="r", *args, **kwargs):
    """
    If `file` is a relative path and there *is* a bundled resource
    at resource_path(file), redirect to that. Otherwise leave it alone.
    """
    # only consider relative paths
    if not os.path.isabs(file):
        bundled = resource_path(file)
        # rewrite *only* if the bundled copy actually exists
        if os.path.exists(bundled):
            file = bundled
    # delegate to the real open()
    return _original_open(file, mode, *args, **kwargs)


# install our override
builtins.open = custom_open


inventory_path = "data/inventory.csv"
sales_path = "data/sales.csv"
settings_path = "data/settings.json"


# Set web folder
eel.init("web")


@eel.expose
def serve(html, web="True"):
    web = "data/" if web == "False" else "web/"
    with open(
        f"{web}{html}" + (".html" if web == "web/" else ""), "r", encoding="utf-8"
    ) as f:
        content = f.read()
        return content


@eel.expose
def getInventory():
    file_path = "data/inventory.csv"
    data = []
    with open(file_path, mode="r", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        for row in reader:
            data.append(row)
    return data


@eel.expose
def getSales():
    file_path = "data/sales.csv"
    data = []
    with open(file_path, mode="r", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        for row in reader:
            data.append(row)
    return data


@eel.expose
def addSales(data):
    file_path = "data/sales.csv"
    try:
        write_header = not os.path.exists(file_path) or os.path.getsize(file_path) == 0
        with open(file_path, mode="a", encoding="utf-8", newline="") as file:
            fieldnames = [
                "id",
                "date",
                "time",
                "item",
                "quantity",
                "price",
                "total",
                "subtotal",
                "tax",
                "grandtotal",
                "name",
                "phone",
            ]
            writer = csv.DictWriter(file, fieldnames=fieldnames)
            if write_header:
                writer.writeheader()
            writer.writerows(data)
        return True
    except Exception as e:
        print(f"Error writing to file: {e}")
        return f"Error writing to file: {e}"


@eel.expose
def setInventory(data):
    file_path = "data/inventory.csv"
    try:
        with open(file_path, mode="w", encoding="utf-8", newline="") as file:
            fieldnames = data[0].keys()
            writer = csv.DictWriter(file, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(data)
        return True
    except Exception as e:
        print(f"Error writing to file: {e}")
        return f"Error writing to file: {e}"


@eel.expose
def getSettings():
    with open(settings_path, mode="r", encoding="utf-8") as file:
        settings = json.load(file)
    return settings


@eel.expose
def openData(file):
    file_path = "data/inventory.csv" if file == "inventory" else "data/sales.csv"
    if platform.system() == "Windows":
        os.startfile(file_path)
    elif platform.system() == "Darwin":  # macOS
        subprocess.Popen(["open", file_path])
    else:  # Linux and others
        subprocess.Popen(["xdg-open", file_path])


@eel.expose
def process_csv(which, file_contents, isnew):
    # only allow inventory or sales
    if which not in ("inventory", "sales"):
        return {"status": "error", "message": f"Unknown type {which}"}

    os.makedirs("data", exist_ok=True)
    target = f"data/{which}.csv"

    # brand-new file: overwrite
    if isnew == "True":
        with open(target, "w", encoding="utf-8", newline="") as f:
            f.write(file_contents)
        return {"status": "created"}

    # otherwise we append
    # 1. parse incoming
    buffer = io.StringIO(file_contents)
    incoming = csv.reader(buffer)
    try:
        header_in = next(incoming)
    except StopIteration:
        return {"status": "error", "message": "Empty CSV upload"}

    # 2. read existing header
    if not os.path.exists(target):
        return {"status": "error", "message": f"{which}.csv does not exist"}
    with open(target, "r", encoding="utf-8", newline="") as f_read:
        existing = csv.reader(f_read)
        try:
            header_ex = next(existing)
        except StopIteration:
            return {"status": "error", "message": f"{which}.csv is empty"}

    # 3. compare
    if header_in != header_ex:
        return {"status": "error", "message": "Header mismatch"}

    # 4. append only data rows
    with open(target, "a", encoding="utf-8", newline="") as f_append:
        writer = csv.writer(f_append)
        rows_appended = 0
        for row in incoming:
            writer.writerow(row)
            rows_appended += 1

    return {"status": "appended", "rows": rows_appended}


@eel.expose
def setSettings(settings):
    with open(settings_path, mode="w", encoding="utf-8") as file:
        json.dump(settings, file)


eel.start(
    "index.html",
    mode="defult",
    cmdline_args=[
        "--start-maximized",
        "--disable-infobars",
    ],
)
