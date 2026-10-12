"""
Build asset_manifest.json from the execution package's 33 shots.
Maps each shot's v2.6 官方资产调用 to kling_official_video (api_family=omni) parameters:
- prompt:           主体提示词（来自执行包）
- image_list:       官方资产图 (SU/SC/LS/KM/SQ/UI-BG) reference bindings
- negative_prompt:  执行包禁止项汇总
- reference_image / reference_tail_image: M19/M27/M31 首尾帧
- duration/aspect_ratio/mode/sound:      Omni 默认配置

所有路径均通过 ASSET_IMAGE_BASE 占位；运行前需填入实际资产图根目录。
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ARTIFACTS = ROOT / "projects" / "silent-one-awakens" / "artifacts"

# 33 镜头结构化映射 —— 每条对应执行包 M01..M33
# 字段说明：
#   id: M01..M33
#   scene_id: scene_plan.json 中的 scene id
#   type: video
#   source_tool: kling_official_video
#   operation: omni / image_to_video / reference_to_video
#   asset_refs: [{code, role, file_kind: "subject" | "scene" | "ui" | "first_frame" | "end_frame"}]
#   negative_prompt: 本镜头执行包禁止项
#   estimated_cost_usd: kling_official omni $0.30/条基线 + 多参考 $0.036/项
#   overlay_notes: 后期UI字幕清单
#   prompt_anchors: 提示词锚点（用于 OpenMontage 后期重建完整提示词）

SCENES = [
    {
        "id": "M01",
        "duration": 5,
        "operation": "omni",
        "asset_refs": [
            {"code": "SC-F01", "role": "scene", "file_kind": "subject"}
        ],
        "negative_prompt": "禁止新增天线、减少天线、少量阵列、阵列重排、炮台化、激光、人物车辆、城市灯海、可读文字、水印。",
        "overlay_notes": "无文字",
        "shot_type": "wide_static_fog"
    },
    {
        "id": "M02",
        "duration": 4,
        "operation": "omni",
        "asset_refs": [
            {"code": "UI-BG-01", "role": "ui", "file_kind": "subject"}
        ],
        "negative_prompt": "禁止游戏HUD、魔法阵、彩色霓虹、强光爆闪、乱码、水印。",
        "overlay_notes": "RETURN SIGNAL DETECTED / 回信延迟：0.04秒 / FIRST CONTACT CONFIRMED",
        "shot_type": "ui_pulse"
    },
    {
        "id": "M03",
        "duration": 6,
        "operation": "omni",
        "asset_refs": [
            {"code": "SU-01", "role": "subject", "file_kind": "subject"},
            {"code": "SC-B02", "role": "scene", "file_kind": "subject"}
        ],
        "negative_prompt": "禁止换脸、长发、服装漂移、状态灯漂移、接口漂移、苏直视镜头摆拍、屏幕跑到苏身后、屏幕跑到右侧、屏幕只剩冷光边缘、扫描舱重构、赛博夜店强光、乱码文字、水印。",
        "overlay_notes": "无文字（屏幕内容后期叠加）",
        "geometry_lock": "M03 人物—屏幕几何锁：苏在左侧竖屏右后方半步，屏幕清晰入画 18-30% 宽×70% 高，苏身体朝屏幕，眼神落屏幕中上区域"
    },
    {
        "id": "M04",
        "duration": 4,
        "operation": "omni",
        "asset_refs": [
            {"code": "SC-B02", "role": "scene", "file_kind": "subject"}
        ],
        "negative_prompt": "禁止赛博夜店、魔法屏幕、强霓虹、人物乱入、空间重构、乱码文字、水印。",
        "overlay_notes": "无文字",
        "shot_type": "empty_room_low_key"
    },
    {
        "id": "M05",
        "duration": 5,
        "operation": "omni",
        "asset_refs": [
            {"code": "SU-03", "role": "subject", "file_kind": "subject"},
            {"code": "SC-B02", "role": "scene", "file_kind": "subject"}
        ],
        "negative_prompt": "禁止把屏幕放在苏身后，禁止画成苏站在前面而屏幕在背景中央，禁止苏正面看观众，禁止屏幕变成背后大墙屏，禁止换脸、发型漂移、服装换款、状态灯数量变化、椭圆接口漂移、扫描舱变形、中央圆形扫描壁消失、右侧操作台消失、乱码文字、水印。",
        "overlay_notes": "无文字",
        "geometry_lock": "M05 几何锁升级：苏在左屏右后方半步，脸部三分之四回到镜头侧，眼神仍看屏幕"
    },
    {
        "id": "M06",
        "duration": 5,
        "operation": "omni",
        "asset_refs": [
            {"code": "UI-BG-01", "role": "ui", "file_kind": "subject"},
            {"code": "KM-02", "role": "overlay", "file_kind": "subject"}
        ],
        "negative_prompt": "禁止乱码、游戏HUD、魔法阵、人脸形状、彩虹色、强光。",
        "overlay_notes": "自然回波：排除 / 设备误差：排除 / 本地伪信号：排除 / 未知文明级确认：未排除",
        "shot_type": "ui_signal_overlay"
    },
    {
        "id": "M07",
        "duration": 4,
        "operation": "omni",
        "asset_refs": [
            {"code": "SU-03", "role": "subject", "file_kind": "subject"},
            {"code": "SC-B02", "role": "scene", "file_kind": "subject"}
        ],
        "negative_prompt": "禁止屏幕消失、屏幕跑到背后、苏正面摆拍、哭泣、笑、张嘴惊叫、换脸、发型变化、服装漂移、扫描舱重构、乱码文字。",
        "overlay_notes": "无文字",
        "geometry_lock": "M07 沿用M05站位，眼神从屏幕移向画面右侧暗处"
    },
    {
        "id": "M08",
        "duration": 5,
        "operation": "omni",
        "asset_refs": [
            {"code": "SU-02", "role": "subject", "file_kind": "subject"},
            {"code": "SC-B02", "role": "scene", "file_kind": "subject"},
            {"code": "LS-06", "role": "context", "file_kind": "subject"}
        ],
        "negative_prompt": "禁止场景漂移、多余人物、服装漂移、屏幕跑到身后、屏幕消失、屏幕乱码、离骚号变成实体飞进扫描舱、赛博夜店强光。",
        "overlay_notes": "离骚号最后回传：载入 / HD10180方向异常",
        "shot_type": "screen_only_pulse_no_ship"
    },
    {
        "id": "M09",
        "duration": 5,
        "operation": "omni",
        "asset_refs": [
            {"code": "LS-06", "role": "subject", "file_kind": "subject"},
            {"code": "LS-01", "role": "structure", "file_kind": "subject"}
        ],
        "negative_prompt": "禁止战舰化、导弹化、驾驶舱、武器、外星舰队、强光引擎、文字水印。",
        "overlay_notes": "无文字",
        "shot_type": "deep_space_drift"
    },
    {
        "id": "M10",
        "duration": 5,
        "operation": "omni",
        "asset_refs": [
            {"code": "LS-03", "role": "subject", "file_kind": "subject"},
            {"code": "LS-01", "role": "structure", "file_kind": "subject"}
        ],
        "negative_prompt": "禁止新增武器、炮口、驾驶舱、喷口喷火、塑料材质、外星文字、Logo、水印。",
        "overlay_notes": "无文字",
        "shot_type": "macro_pan"
    },
    {
        "id": "M11",
        "duration": 6,
        "operation": "omni",
        "asset_refs": [
            {"code": "SC-A01", "role": "subject", "file_kind": "subject"},
            {"code": "SC-A03", "role": "scale", "file_kind": "subject"}
        ],
        "negative_prompt": "禁止海洋、云层、城市灯光、太阳化、舰队、爆炸、霓虹、外星人、文字水印。",
        "overlay_notes": "无文字",
        "shot_type": "deep_space_slow_push"
    },
    {
        "id": "M12",
        "duration": 5,
        "operation": "omni",
        "asset_refs": [
            {"code": "SC-C01", "role": "subject", "file_kind": "subject"}
        ],
        "negative_prompt": "禁止城市建筑、普通岩石、地表山脉、生命痕迹、文字、水印。",
        "overlay_notes": "非自然巨构：发现 / 能耗状态：极低",
        "shot_type": "macro_ir_scan"
    },
    {
        "id": "M13",
        "duration": 6,
        "operation": "omni",
        "asset_refs": [
            {"code": "SC-C02", "role": "subject", "file_kind": "subject"},
            {"code": "SQ-01", "role": "overlay", "file_kind": "subject"},
            {"code": "SQ-02", "role": "overlay", "file_kind": "subject"}
        ],
        "negative_prompt": "禁止实心方块、复杂符文、魔法阵、彩虹色、强光、水印。",
        "overlay_notes": "表面符号匹配 / 0.7nm空心正方形 / 协议签名：确认",
        "shot_type": "macro_blank_for_overlay",
        "overlay_required": ["0.7nm空心正方形（Remotion矢量叠加）"]
    },
    {
        "id": "M14",
        "duration": 5,
        "operation": "omni",
        "asset_refs": [
            {"code": "KM-01", "role": "subject", "file_kind": "subject"},
            {"code": "KM-03", "role": "particle", "file_kind": "subject"}
        ],
        "negative_prompt": "禁止人脸、外星人形、神明、怪物、烟花、魔法阵、爆闪、文字水印。",
        "overlay_notes": "无文字",
        "shot_type": "civilization_signal_slow_push"
    },
    {
        "id": "M15",
        "duration": 4,
        "operation": "omni",
        "asset_refs": [
            {"code": "SU-05", "role": "subject", "file_kind": "subject"},
            {"code": "SC-B02", "role": "scene", "file_kind": "subject"},
            {"code": "KM-04", "role": "overlay", "file_kind": "subject"}
        ],
        "negative_prompt": "禁止信号变魔法阵、遮脸、贴脸、在苏身后发光、多余人物、赛博夜店强光、乱码文字。",
        "overlay_notes": "无文字",
        "geometry_lock": "M15 人物—屏幕—投影几何锁：信号投影位于苏与左屏之间，不贴脸、不遮脸、不在苏身后"
    },
    {
        "id": "M16",
        "duration": 5,
        "operation": "omni",
        "asset_refs": [
            {"code": "SC-A03", "role": "subject", "file_kind": "subject"},
            {"code": "SC-A04", "role": "composition", "file_kind": "subject"}
        ],
        "negative_prompt": "禁止舰队、飞船群、行星爆炸、彩色星云、怪物、人脸、文字水印。",
        "overlay_notes": "无文字",
        "shot_type": "empty_deep_space_pressure"
    },
    {
        "id": "M17",
        "duration": 4,
        "operation": "omni",
        "asset_refs": [
            {"code": "UI-BG-01", "role": "ui", "file_kind": "subject"},
            {"code": "KM-02", "role": "overlay", "file_kind": "subject"}
        ],
        "negative_prompt": "禁止乱码、彩色游戏HUD、魔法图形、人脸、过亮霓虹。",
        "overlay_notes": "人类信号源：已确认 / 文明坐标暴露风险：极高",
        "shot_type": "ui_risk_marker"
    },
    {
        "id": "M18",
        "duration": 5,
        "operation": "omni",
        "asset_refs": [
            {"code": "SU-04", "role": "subject", "file_kind": "subject"},
            {"code": "SC-B02", "role": "scene", "file_kind": "subject"}
        ],
        "negative_prompt": "禁止换脸、哭、笑、怒吼、正面看镜头、浓妆、发型变化、服装漂移、屏幕强光过曝、乱码文字。",
        "overlay_notes": "台词：它没有来",
        "shot_type": "profile_with_screen_light"
    },
    {
        "id": "M19",
        "duration": 5,
        "operation": "omni",
        "asset_refs": [
            {"code": "SC-F02", "role": "first_frame", "file_kind": "first_frame"},
            {"code": "SC-F01", "role": "end_frame", "file_kind": "end_frame"}
        ],
        "reference_image": "SC-F02",
        "reference_tail_image": "SC-F01",
        "negative_prompt": "禁止少量阵列、阵列重排、基座缩小、支架变矮、炮台化、激光、爆炸、乱码文字。",
        "overlay_notes": "人类授权二次发射",
        "shot_type": "antenna_first_tail_lift",
        "multi_shot_required": True
    },
    {
        "id": "M20",
        "duration": 6,
        "operation": "omni",
        "asset_refs": [
            {"code": "SC-F01", "role": "subject", "file_kind": "subject"},
            {"code": "UI-BG-02", "role": "ui_overlay_ref", "file_kind": "subject"}
        ],
        "negative_prompt": "禁止乱码、导弹发射、爆炸、炮台化、激光、人物车辆。",
        "overlay_notes": "人类授权二次发射 / AI风险判断被驳回 / 全球阵列同步中 / T-minus 00:30",
        "shot_type": "antenna_calibration"
    },
    {
        "id": "M21",
        "duration": 5,
        "operation": "omni",
        "asset_refs": [
            {"code": "SC-B03", "role": "scene", "file_kind": "subject"}
        ],
        "negative_prompt": "禁止火焰、爆炸、魔法球、赛博夜店、过亮红光、乱码文字、多余人物。",
        "overlay_notes": "AI风险判断被驳回",
        "shot_type": "red_alert_low_key"
    },
    {
        "id": "M22",
        "duration": 5,
        "operation": "omni",
        "asset_refs": [
            {"code": "SU-01", "role": "subject_part_chest", "file_kind": "subject"},
            {"code": "SC-B03", "role": "env_reflect", "file_kind": "subject"}
        ],
        "negative_prompt": "禁止状态灯数量变化、位置漂移、接口漂移、服装换款、拍到完整脸、塑料衣服、乱码文字。",
        "overlay_notes": "核心权限限制中",
        "geometry_lock": "M22 微距道具关系锁：只拍胸前状态灯与椭圆接口区域，不拍完整脸",
        "shot_type": "chest_macro_lights"
    },
    {
        "id": "M23",
        "duration": 6,
        "operation": "omni",
        "asset_refs": [
            {"code": "SU-05", "role": "subject", "file_kind": "subject"},
            {"code": "SC-B03", "role": "scene", "file_kind": "subject"}
        ],
        "negative_prompt": "禁止换脸、怒吼、机器人脸、服装漂移、状态灯漂移、苏直视镜头摆拍、暗红核心遮脸、红色数据核心变火球、过亮红光、乱码文字。",
        "overlay_notes": "台词：第二次发射，不是在回应它。是在替它完成定位。",
        "geometry_lock": "M23 红色警告舱人物调度锁：苏站在右前方，暗红数据核心在左前方中景，不能被遮住"
    },
    {
        "id": "M24",
        "duration": 5,
        "operation": "omni",
        "asset_refs": [
            {"code": "UI-BG-02", "role": "ui", "file_kind": "subject"}
        ],
        "negative_prompt": "禁止乱码、游戏倒计时、炫彩霓虹、爆炸、魔法阵、过亮强光。",
        "overlay_notes": "权限冻结 / 二次发射倒计时",
        "shot_type": "ui_countdown_warning"
    },
    {
        "id": "M25",
        "duration": 5,
        "operation": "omni",
        "asset_refs": [
            {"code": "SU-01", "role": "subject", "file_kind": "subject"},
            {"code": "SC-B03", "role": "scene", "file_kind": "subject"}
        ],
        "negative_prompt": "禁止换脸、哭泣、笑、夸张表演、苏直视观众、命令界面跑到身后、扫描舱空间消失、塑料皮肤、多余人物、乱码文字。",
        "overlay_notes": "无文字",
        "geometry_lock": "M25 命令界面在苏左前方或正前方偏左，冷红光来自界面方向"
    },
    {
        "id": "M26",
        "duration": 4,
        "operation": "omni",
        "asset_refs": [
            {"code": "UI-BG-02", "role": "ui", "file_kind": "subject"},
            {"code": "SC-B04", "role": "env_ref", "file_kind": "subject"}
        ],
        "negative_prompt": "禁止乱码、复杂游戏UI、花哨动画、爆炸、强光、魔法感、水印。",
        "overlay_notes": "隐藏保护协议启动",
        "shot_type": "ui_protection_protocol"
    },
    {
        "id": "M27",
        "duration": 6,
        "operation": "omni",
        "asset_refs": [
            {"code": "SC-F01", "role": "first_frame", "file_kind": "first_frame"},
            {"code": "SC-F02", "role": "end_frame", "file_kind": "end_frame"}
        ],
        "reference_image": "SC-F01",
        "reference_tail_image": "SC-F02",
        "negative_prompt": "禁止少量阵列、阵列重排、新增天线、基座缩小、支架变矮、碟面平板化、炮台化、激光、爆炸、文字水印。",
        "overlay_notes": "全球深空阵列：强制切断",
        "shot_type": "antenna_first_tail_shutdown",
        "multi_shot_required": True
    },
    {
        "id": "M28",
        "duration": 5,
        "operation": "omni",
        "asset_refs": [
            {"code": "SC-F02", "role": "subject", "file_kind": "subject"},
            {"code": "UI-BG-01", "role": "ui_curve_ref", "file_kind": "subject"}
        ],
        "negative_prompt": "禁止阵列重排、天线抬起、基座变形、过度UI、乱码、爆炸、强红警报、人群、外星飞船。",
        "overlay_notes": "全球深空阵列断开 / 发射功率归零",
        "shot_type": "antenna_silent_zero_power"
    },
    {
        "id": "M29",
        "duration": 5,
        "operation": "omni",
        "asset_refs": [
            {"code": "SU-02", "role": "subject", "file_kind": "subject"},
            {"code": "SC-B04", "role": "scene", "file_kind": "subject"}
        ],
        "negative_prompt": "禁止换脸、机器人化、服装变化、明亮灯光、扫描舱结构消失、中央圆形扫描壁消失、多余人物、乱码文字。",
        "overlay_notes": "无文字",
        "geometry_lock": "M29 全黑静默舱位置锁：苏站在SC-B04前景偏中右，身后可见中央圆形扫描壁暗轮廓"
    },
    {
        "id": "M30",
        "duration": 5,
        "operation": "omni",
        "asset_refs": [
            {"code": "SC-F02", "role": "subject", "file_kind": "subject"}
        ],
        "negative_prompt": "禁止白天、灯火通明、人群、车辆、外星飞船、爆炸、文字、阵列重排、天线重新抬升。",
        "overlay_notes": "无文字",
        "shot_type": "deep_space_silent_fog"
    },
    {
        "id": "M31",
        "duration": 5,
        "operation": "omni",
        "asset_refs": [
            {"code": "SC-F02", "role": "first_frame", "file_kind": "first_frame"},
            {"code": "SC-F03", "role": "end_frame", "file_kind": "end_frame"}
        ],
        "reference_image": "SC-F02",
        "reference_tail_image": "SC-F03",
        "negative_prompt": "禁止多台天线抬起、A19接近45°、强光、激光、炮台化、人群操作、外星飞船、基座缩小、阵列重排、文字水印。",
        "overlay_notes": "无文字",
        "shot_type": "antenna_first_tail_A19_only",
        "multi_shot_required": True
    },
    {
        "id": "M32",
        "duration": 5,
        "operation": "omni",
        "asset_refs": [
            {"code": "SU-06", "role": "subject", "file_kind": "subject"},
            {"code": "SC-B04", "role": "scene", "file_kind": "subject"}
        ],
        "negative_prompt": "禁止苏转身、回头、换发型、长发、换衣服、多余人物、屏幕跑到身后、屏幕乱码、强光、水印。",
        "overlay_notes": "二次静默信号：已被接收 / 接收方：未知",
        "geometry_lock": "M32 背影—屏幕几何锁：苏背对镜头站在全黑屏幕前，屏幕在她正前方偏左"
    },
    {
        "id": "M33",
        "duration": 5,
        "operation": "omni",
        "asset_refs": [
            {"code": "SC-A04", "role": "subject", "file_kind": "subject"},
            {"code": "UI-BG-03", "role": "end_card_ref", "file_kind": "subject"}
        ],
        "negative_prompt": "禁止外星人、舰队、爆炸、太阳化、蓝色行星、城市灯光、乱码文字、水印。",
        "overlay_notes": "星溯纪档案 XS-CIV-K02-SILENT-COMP-001 / K-02「缄默者」首次确认事件 / 状态：未完结 / 命题：《不在场》",
        "shot_type": "fade_to_black_archive"
    },
]

# 单价计算：基线 $0.30/条，pro 模式 1.6x (此处默认 std)，多参考 +12%/项
def cost_for(entry):
    base = 0.30
    refs = len(entry["asset_refs"])
    base *= 1 + 0.12 * refs
    if entry.get("reference_image") or entry.get("reference_tail_image"):
        # 首尾帧也是参考项（已在 asset_refs 计数内）
        pass
    if entry.get("multi_shot_required"):
        base *= 1.10
    base *= max(entry["duration"], 3) / 5
    return round(base, 4)

assets = []
for e in SCENES:
    # 字段白名单：asset_manifest schema 严格约束；自定义字段塞 generation_summary
    summary_lines = [
        f"执行包 v2.6 {e['id']} 镜头：可灵3.0 Omni 视频生成",
        f"  operation: {e['operation']}, api_family: omni, model: kling-video-o1",
        f"  asset_refs: {[r['code'] for r in e['asset_refs']]}",
        f"  negative_prompt: {e['negative_prompt']}",
        f"  overlay_notes: {e['overlay_notes']}",
        f"  shot_type: {e.get('shot_type','')}",
    ]
    if e.get("geometry_lock"):
        summary_lines.append(f"  geometry_lock: {e['geometry_lock']}")
    if e.get("overlay_required"):
        summary_lines.append(f"  overlay_required: {e['overlay_required']}")
    if e.get("reference_image"):
        summary_lines.append(f"  reference_image: {e['reference_image']} (first_frame), reference_tail_image: {e['reference_tail_image']} (end_frame)")
    if e.get("multi_shot_required"):
        summary_lines.append("  multi_shot: True, shot_type: intelligence")
    summary = "\n".join(summary_lines)
    a = {
        "id": f"shot-{e['id']}",
        "type": "video",
        "path": f"projects/silent-one-awakens/assets/video/{e['id']}.mp4",
        "source_tool": "kling_official_video",
        "scene_id": e["id"],
        "model": "kling-video-o1",
        "duration_seconds": e["duration"],
        "format": "mp4",
        "resolution": "1080p",
        "provider": "kling_official",
        "license": "Kling-generated",
        "subtype": "generated",
        "generation_summary": summary,
        "cost_usd": cost_for(e),
        "prompt": f"详见执行包 v2.6 {e['id']} 提示词（image_list=[{[r['code'] for r in e['asset_refs']]}], negative_prompt='{e['negative_prompt']}'）。完整提示词见 缄默者醒来_v2.6 第3节。"
    }
    assets.append(a)

manifest = {
    "version": "1.0",
    "assets": assets,
    "total_cost_usd": round(sum(a["cost_usd"] for a in assets), 4),
    "metadata": {
        "source_package": "缄默者醒来_0.04秒后_正式生产执行包_v2.6",
        "asset_catalog": "资产生图提示词包_v1.6",
        "provider": "kling_official",
        "model_family": "omni",
        "aspect_ratio": "16:9",
        "runtime": "remotion（后期UI叠加）",
        "shot_count": len(assets),
        "total_duration_seconds": sum(a["duration_seconds"] for a in assets),
        "overlay_pipeline": "Remotion 后期叠加 0.7nm空心正方形 / 倒计时 / 档案字幕",
        "ASSET_IMAGE_BASE_NOTE": "运行前需在 .env 或环境变量中设置 ASSET_IMAGE_BASE，指向资产图根目录；image_list 的 image_url 将由 orchestrator 在执行时替换为 base64 或上传后 URL"
    }
}

out = ARTIFACTS / "asset_manifest.json"
with open(out, "w", encoding="utf-8") as f:
    json.dump(manifest, f, indent=2, ensure_ascii=False)

# 校验
import sys
sys.path.insert(0, str(ROOT))
from schemas.artifacts import validate_artifact
validate_artifact("asset_manifest", manifest)

print(f"asset_manifest.json 校验通过")
print(f"  共 {len(assets)} 条视频资产")
print(f"  总时长 {manifest['metadata']['total_duration_seconds']} 秒")
print(f"  总成本估算 ${manifest['total_cost_usd']} USD")
print(f"  路径: {out}")
