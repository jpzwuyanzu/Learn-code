import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  Layout,
  Button,
  // theme,
  message,
  Dropdown,
  Space,
  Badge,
  Switch,
} from "antd";
import { BellOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { respMessage } from "@/utils/message";
import { useNavigate } from "react-router-dom";
import { switchCollapsed } from "./../store/slices/collapse.slice";
import { useAppDispatch, useAppSelector } from "./../hooks/hooks";
import useWebSocket from "@/hooks/useWebSocket";
import ResetPassModal from "@/components/ResetPassModal";
import ChangeAvatorModal from "@/components/ChangeAvatorModal";
import ChatRoomIndex from "@/components/ChatRoom/ChatRoomIndex";
// import CusColor from "@/components/CusColor";
import styles from "./TopHeader.module.scss";
import {
  LoginOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  GithubOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import {
  loginOut,
  loadCusList,
  loadTradeStatic,
  loadProxyDetailInfo,
  changeHeadImg,
} from "./../api/index";
import msgWaring from "@/assets/10759.mp3";
import { switchUnreadNum } from "@/store/slices/message.slice";
import dayjs from "dayjs";
import { switchAmountNum } from "@/store/slices/proxy.slice";
import { switchChatPeopleNum } from "@/store/slices/static.slice";
import { clearAllCookie } from '@/utils/common'

const { Header } = Layout;
export default function TopHeader() {
  const [_createWebSocket, ws, wsData] = useWebSocket(import.meta.env.VITE_APP_WS_URL,{});
  const { pathname } = useLocation();
  const userInfo = useAppSelector((state) => state.user.userInfo);
  const collapsed = useAppSelector((state) => state.collapse.status);
  const cusColor = useAppSelector((state) => state.cusColor.color);
  const proxyOrderStatic = useAppSelector((state) => state.chatPeople)
  const unReadNum = useAppSelector((state) => state.unreadNum.unreadNum);
  const refreshNow = useAppSelector((state) => state.unreadNum.isRefreshCus);
  const amoutNum = useAppSelector((state) => state.amountNum.amountNum);
  const proxyStatus = useAppSelector((state) => state.amountNum.openStatus);
  const warningRef = useRef(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  //重置密码
  const [modalStatus, setModalStatus] = useState(false);
  //聊天室
  const [chatRoomStatus, setChatRoomStatus] = useState(false);
  //修改用户头像
  const [avatorModalStatus, setAvatorModalStatus] = useState(false);
  console.log('test',refreshNow)

  // 退出登录
  const loginOutNow = async () => {
    const resp: any = await loginOut();
    if (resp.code && resp.code === 200) {
      localStorage.clear();
      sessionStorage.clear();
      clearAllCookie()
      ws && ws.close()
      // navigate("/login");
      location.href = '/login'
      message.open({
        type: "success",
        content: "退出登录",
      });
    } else {
      message.open({
        type: "error",
        content: respMessage[String(resp.payload.code)],
      });
    }
  };
  //关闭修改密码
  const closeModal = () => {
    setModalStatus(false);
  };
  //关闭修改头像
  const closeAvatorModal = () => {
    setAvatorModalStatus(false);
  };
  //打开聊天室
  const openChatRoom = async () => {
    const res: any = await loadCusList({});
    if (res && res.code === 200) {
      // setUnReadNum(0)
      dispatch(switchUnreadNum({ ac: "equal", num: 0 } as any));
      if (res.data.chat.length) {
        // setChatRoomStatus(true)
        //直接跳转客服页面，同时将未读数字设置为0
        navigate("/payment/cusroom");
      } else {
        message.open({
          type: "success",
          content: "订单已关闭，暂无待处理订单",
          className: "custom-class"
        });
      }
    }
  };
  //关闭聊天室
  const closeChatRoom = async () => {
    setChatRoomStatus(false);
  };
  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <div
          className={styles.dropDown_Items}
          onClick={() => setAvatorModalStatus(true)}
        >
          修改头像
        </div>
      ),
      icon: <GithubOutlined />,
    },
    {
      key: "2",
      label: (
        <div
          className={styles.dropDown_Items}
          onClick={() => setModalStatus(true)}
        >
          修改密码
        </div>
      ),
      icon: <SettingOutlined />,
    },
    {
      type: "divider",
    },
    {
      key: "3",
      label: (
        <div className={styles.dropDown_Items} onClick={() => loginOutNow()}>
          退出登录
        </div>
      ),
      icon: <LoginOutlined />,
    },
  ];

  //获取当前代理的订单信息统计
  const loadCurrentProxyStatic = async () => {
    const res: any = await loadTradeStatic({
      page: 1,
      pageSize: 10,
      startTime: dayjs(new Date()).format("YYYY-MM-DD") + " 00:00:00",
      endTime: dayjs(new Date()).format("YYYY-MM-DD") + " 23:59:59",
      agentId: userInfo.id,
    });
    if (res && res.code === 200) {
      // setProxyorderStatic(res.page.list[0]);
      dispatch(switchChatPeopleNum(res.page.list.length ? res.page.list[0] : {'chatPeople':0, 'totalRechargeCount': 0,'rechargePeople': 0,'rechargeCount': 0}))
    }
  };


  //查询店铺状态
  const loadProxyStatus = async () => {
    const res: any = await loadProxyDetailInfo({});
    if (res && res.code === 200) {
      dispatch(switchAmountNum(res.data.agent))
    }
  };

  //开启关闭店铺
  const switchCurrentProxyInfo = async (checked: any) => {
    const res: any = await changeHeadImg({
      id: userInfo.id,
      openStatus: Number(Boolean(checked) ? 1 : 2),
    });
    if (res && res.code === 200) {
      message.open({ type: "success", content: "修改成功" });
      loadProxyStatus();
    }
  };

  useEffect(() => {
    if ((wsData && wsData.msgId && wsData.type) || (wsData.code && wsData.code === 2)) {
      if (pathname === "/payment/cusroom") {
        // setUnReadNum(unReadNum+1)
        // dispatch(switchUnreadNum({ 'ac': 'add', 'num': 1 } as any))
        // location.reload()
        dispatch(switchUnreadNum({ 'ac': 'fresh', value: true} as any))
      }
      warningRef && (warningRef.current as any).play();
    }
  }, [wsData]);

  useEffect(() => {
    if (userInfo && userInfo.userType === 1) {
      loadCurrentProxyStatic();
      loadProxyStatus();
    }
  }, [userInfo]);

  useEffect(() => {
    return () => {
      ws && ws.close()
    }
  }, [])

  return (
    <>
      {/* <Header style={{ padding: 0, background: colorBgContainer }}> */}
      <Header style={{ padding: 0 }}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => dispatch(switchCollapsed())}
          style={{
            fontSize: "16px",
            width: 64,
            height: 64,
            color: `${cusColor}`,
            float: "left",
          }}
        />
        {userInfo.userType === 1 ? (
          <div className={styles.top_header_static}>
            <div className={styles.static_item}>
              <span className={styles.static_num}>
                {proxyOrderStatic && proxyOrderStatic.chatPeople
                  ? proxyOrderStatic.chatPeople
                  : 0}
              </span>
              <span className={styles.static_label}>今日接待</span>
            </div>
            <div className={styles.static_item}>
              <span className={styles.static_num}>
                {proxyOrderStatic &&
                proxyOrderStatic.totalRechargeCount &&
                proxyOrderStatic.rechargePeople
                  ? Number(proxyOrderStatic.totalRechargeCount) -
                    Number(proxyOrderStatic.rechargePeople)
                  : 0}
              </span>
              <span className={styles.static_label}>未付款</span>
            </div>
            <div className={styles.static_item}>
              <span className={styles.static_num}>
                {proxyOrderStatic && proxyOrderStatic.rechargeCount
                  ? proxyOrderStatic.rechargeCount
                  : 0}
              </span>
              <span className={styles.static_label}>已付款</span>
            </div>
          </div>
        ) : null}
        {/* {userInfo.userType === 1 ? (
          <div
            className={styles.reloadBtn}
            onClick={() => loadCurrentProxyStatic()}
          >
            <RedoOutlined />
          </div>
        ) : null} */}
        <div className={styles.user_head_container}>
          <Space>
            {userInfo.userType === 1 ? (
              <>
                <div className={styles.storeAmount}>
                  <span className={styles.storeLabel}>店铺余额: </span>
                  <span className={styles.storeAc}>
                    ¥{Number(Number(amoutNum) / 100).toFixed(2)}
                  </span>
                </div>
                <div className={styles.storeStatus}>
                  <span className={styles.storeStatuslabel}>店铺状态: </span>
                  <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    checked={(Number(proxyStatus) === 1 ? true : false)}
                    onClick={(checked: boolean) =>
                      switchCurrentProxyInfo(checked)
                    }
                  />
                </div>
              </>
            ) : null}
            {/* <CusColor /> */}
            {userInfo.userType === 1 ? (
              <div
                className={styles.ring_container}
                onClick={() => openChatRoom()}
              >
                <Badge count={unReadNum as any}>
                  <BellOutlined
                    className={styles.messageTips}
                    style={{ color: "white" }}
                  />
                  <audio
                    className={styles.audio_player}
                    ref={warningRef}
                    controls
                    src={msgWaring}
                    preload="preload"
                  />
                </Badge>
              </div>
            ) : null}
          </Space>
          <Dropdown menu={{ items }} placement="bottom">
            <a onClick={(e) => e.preventDefault()}>
              <Space>
                <span className={styles.user_head}>
                  <img
                    className={styles.user_Img}
                    src={userInfo.fastUrl + userInfo.headImage}
                    alt=""
                    style={{ borderRadius: "50%" }}
                  />
                  <span className={styles.user_Name}>{userInfo.name}</span>
                </span>
              </Space>
            </a>
          </Dropdown>
        </div>
        <ResetPassModal
          open={modalStatus}
          userInfo={userInfo}
          closeModal={closeModal}
          isTop={true}
        />
        <ChatRoomIndex open={chatRoomStatus} closeChatRoom={closeChatRoom} />
        <ChangeAvatorModal
          open={avatorModalStatus}
          userInfo={userInfo}
          closeModal={closeAvatorModal}
        />
      </Header>
    </>
  );
}
