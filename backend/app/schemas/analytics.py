from pydantic import BaseModel
from typing import List, Union
from datetime import date

class AnalyticsDataPoint(BaseModel):
    period: Union[date, str]
    total_minutes: int

class AnalyticsSummaryResponse(BaseModel):
    user_id: int
    group_by: str
    data: List[AnalyticsDataPoint]
