"""线索与回复：用采集到的需求找到可能需要你产品的人，AI 写回复，你批准后发出，再查谁回了。

- store.py   线索存储（一个 JSON 文件）和「不再联系」名单
- agent.py   调 Claude：判断合不合适、写回复草稿、读懂对方的回复（anthropic 用到时才 import）
- senders.py 官方接口发回复、查回复：Reddit、X；其他平台复制后自己去发
- manager.py 把上面串起来，给 server.py 用的 Outreach
"""
from .agent import AgentError
from .manager import Outreach
from .senders import SendError, mode_for

__all__ = ["Outreach", "AgentError", "SendError", "mode_for"]
