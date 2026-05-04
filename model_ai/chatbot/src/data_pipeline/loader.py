class Loader:

    def __init__(self, folder_path: str):
        self.folder_path = folder_path

    def read_json_file(self, file_path: str):
        import json
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return data
    
    def read_all_json_files(self, folder_path=None):
        import glob
        import os

        if folder_path is None:
            folder_path = self.folder_path

        all_data = []
        files = glob.glob(os.path.join(folder_path, '*.json'))

        for file in files:
            data = self.read_json_file(file)
            all_data.append(data)

        return all_data
    
    def load_documents(self):
        documents = []

        for data in self.read_all_json_files(self.folder_path):
            if isinstance(data, list):
                documents.extend(data)
            else:
                documents.append(data)

        return documents