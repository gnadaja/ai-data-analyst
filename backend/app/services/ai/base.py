from typing import Protocol


class AIService(Protocol):
    def create_report(self, dataset_profile: dict) -> dict | None:
        ...
