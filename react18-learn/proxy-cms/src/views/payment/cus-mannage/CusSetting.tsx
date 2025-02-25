import React, { useState, useEffect, useCallback } from "react";
import {
  Space,
  Table,
  Button,
  Form,
  Col,
  Row,
  message,
  Popconfirm,
  Input
} from "antd";
import { respMessage } from "@/utils/message";
import { quickFeedBack, delQuickFeedBack, updateQuickFeedBack } from "@/api/index";
import dayjs from "dayjs";
import CusSettingModule from "./modules/CusSettingModule";
import styles from "./CusSetting.module.scss";

const { TextArea } = Input;

const CusSetting: React.FC = () => {
  const [tableList, setTableList] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [moduleWidth, setModuleWidth] = useState("");
  const [quickFeedBackInfo, setUserInfo] = useState({});
  const [loading, setLoading] = useState<boolean>(false);
  const [welcomeContent, setWelcomeContent] = useState('');
  const [welComeInfo, setWelcomeInfo] = useState<any>('');
  const [searchUserForm] = Form.useForm();

  const onFinish = (_values: any) => {
    // fetchData(values);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  //查询欢迎语
  const loadWelComeMsg = async() => {
    const data: any = await quickFeedBack({ type: 1});
    if (data && data.code && data.code === 200) {
      console.log(data)
      setWelcomeContent(data.data.list && data.data.list.length ? data.data.list[0]['content'] : '');
      setWelcomeInfo(data.data.list && data.data.list.length ? data.data.list[0] : '')
    } else {
      message.open({
        type: "error",
        content: respMessage[String(data.code)],
      });
    }
  }

  //编辑店铺欢迎语
  const editWelcome = async() => {
    let params: any = {};
    if(welComeInfo){
      params.id = welComeInfo.id
    }
    const res: any = await updateQuickFeedBack({
      content: welcomeContent,
      status: 1,
      type:1,
      ...params
    });
    if (res && res.code && res.code === 200) {
      message.open({
        type: "success",
        content: "编辑成功",
      });
      loadWelComeMsg()
    } else {
      message.open({
        type: "error",
        content: respMessage[String(res.code)],
      });
    }
  }

  const fetchData = async (params?: any) => {
    setLoading(true);
    const data: any = await quickFeedBack({ ...params, type: 0});
    setLoading(false);
    if (data && data.code && data.code === 200) {
      setTableList(data.data.list ? data.data.list : []);
    } else {
      message.open({
        type: "error",
        content: respMessage[String(data.code)],
      });
    }
  };

  const confirmDelRole = async (userId: any) => {
    const resp: any = await delQuickFeedBack({ id: userId });
    if (resp && resp.code && resp.code === 200) {
      fetchData({});
    } else {
      message.open({
        type: "error",
        content: respMessage[String(resp.code)],
      });
    }
  };

  const columns: any = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      align: "center",
      render: (text: any) => <span>{text}</span>,
    },
    {
      title: "回复内容",
      dataIndex: "content",
      key: "content",
      align: "center",
      render: (
        text:
          | string
          | number
          | boolean
          | React.ReactElement<any, string | React.JSXElementConstructor<any>>
          | React.ReactFragment
          | React.ReactPortal
          | null
          | undefined
      ) => <span>{text}</span>,
    },
    {
      title: "排序",
      dataIndex: "seq",
      align: "center",
      key: "seq",
      width: 88,
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      align: "center",
      key: "createTime",
      render: (
        text: string | number | Date | dayjs.Dayjs | null | undefined
      ) => <>{dayjs(text).format("YYYY-MM-DD hh:mm:ss")}</>,
    },
    {
      title: "更新时间",
      key: "updateTime",
      align: "center",
      dataIndex: "updateTime",
      render: (
        text: string | number | Date | dayjs.Dayjs | null | undefined
      ) => <>{dayjs(text).format("YYYY-MM-DD hh:mm:ss")}</>,
    },
    {
      title: "操作",
      key: "action",
      align: "center",
      width: 350,
      render: (_: any, record: any) => (
        <Space size="middle">
          {/* <JudgePemission pageUrl={"/payment/userlist_133"}> */}
          <Button type="primary" onClick={() => openDrawer("378px", record)}>
            编辑
          </Button>
          {/* </JudgePemission> */}
          <Popconfirm
            title="删除"
            description="你确认删除该回复吗?"
            onConfirm={() => confirmDelRole(record.id)}
            onCancel={() => {}}
            okText="是"
            cancelText="否"
          >
            <Button type="primary" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  //新增/编辑用户
  const openDrawer = (moduleWidth: string, quickFeedBackInfo: any) => {
    setModuleWidth(moduleWidth);
    setUserInfo({ ...quickFeedBackInfo });
    setOpen(true);
  };
  //关闭抽屉
  const closeDrawer = useCallback(() => {
    setOpen(false);
    fetchData({});
  }, [open]);

  useEffect(() => {
    fetchData({});
    loadWelComeMsg()
  }, []);

  return (
    <div className={styles.TableCom_Container}>
      <div className={styles.Table_ContentArea}>
        <div className={ styles.welcome_tips }>
          <div className={ styles.welcom_label }>店铺欢迎语：</div>
          <TextArea
              className={ styles.welcome_input }
              value={welcomeContent}
              onChange={(val) => setWelcomeContent(val.target.value)}
              rows={4}
              placeholder="请输入店铺欢迎语"
              maxLength={500}
              onBlur={() => editWelcome()}
            />
             <div className={styles.saveWel_btn}>
             <Button
                    type="primary"
                    style={{ marginTop: "19px" }}
                    onClick={() => editWelcome()}
                  >
                    保存
                  </Button>
             </div>
        </div>
        <div className={styles.table_search}>
          <Form
            form={searchUserForm}
            name="basic"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            initialValues={{
              status: 0,
              userType: "",
            }}
          >
            <Row justify="start">
              {/* </JudgePemission> */}
              {/* <JudgePemission pageUrl={"/payment/userlist_132"}> */}
              <Col span={1}>
                <Form.Item wrapperCol={{ offset: 0, span: 16 }}>
                  <Button
                    type="primary"
                    style={{ marginLeft: "19px" }}
                    onClick={() => openDrawer("378px", {})}
                  >
                    新增回复
                  </Button>
                </Form.Item>
              </Col>
              {/* </JudgePemission> */}
            </Row>
          </Form>
        </div>
        <div className={styles.table_content}>
          <Table
            columns={columns}
            dataSource={tableList}
            loading={loading}
            pagination={false}
            rowKey={(record) => record.id}
            scroll={{ y: "60vh" }}
          />
        </div>
        {/* <div className={styles.bottom_Pag_area}>
          <PagiNation
            current={page}
            pageSize={pageSize}
            total={total}
            loadData={loadData}
          />
        </div> */}
      </div>
      <CusSettingModule
        moduleWidth={moduleWidth}
        quickFeedBackInfo={quickFeedBackInfo}
        open={open}
        closeDrawer={closeDrawer}
      />
    </div>
  );
};

export default CusSetting;
