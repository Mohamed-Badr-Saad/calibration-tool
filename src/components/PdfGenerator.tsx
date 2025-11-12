import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
  Image,
} from "@react-pdf/renderer";
import React from "react";
import type { CalibrationFormData, tolerancesType } from "@/types";
import { isOutOfTolerance, isValveTimeOutOfTolerance } from "@/helperFunctions";
import { Button } from "./ui/button";

let tolerancesValues: tolerancesType = {};

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    fontSize: 16,
    // marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  section: {
    marginBottom: 15,
    padding: 10,
    border: "1px solid #000",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    textDecoration: "underline",
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
  },
  label: {
    width: 100,
    fontWeight: "bold",
  },
  value: {
    flex: 1,
  },
  table: {
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #000",
  },
  tableHeader: {
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
    padding: 5,
    flex: 1,
    border: "1px solid #000",
    textAlign: "center",
  },
  tableCell: {
    padding: 5,
    flex: 1,
    border: "1px solid #000",
    textAlign: "center",
  },
  redTableCell: {
    padding: 5,
    flex: 1,
    border: "1px solid #000",
    textAlign: "center",
    color: "red",
    fontWeight: "bold",
  },
  checklistGrid: {
    flexDirection: "column",
  },
  checklistItem: {
    flexDirection: "row",
    marginBottom: 3,
    paddingBottom: 3,
    borderBottom: "0.5px solid #ccc",
  },
  checklistLabel: {
    width: 200,
    fontSize: 9,
  },
  checklistValue: {
    width: 50,
    fontSize: 9,
    fontWeight: "bold",
  },
  signatures: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingTop: 10,
    borderTop: "1px solid #000",
  },
  signatureBox: {
    width: 150,
    textAlign: "center",
  },
});

// 🔥 FIXED: Instrument-specific checklist mappings
const getChecklistForInstrument = (instrumentType: string, checklist: any) => {
  const checklistMappings = {
    Transmitter: [
      { label: "Visual Inspection", key: "exInspection" },
      { label: "Sensor Element Status", key: "sensorStatus" },
      { label: "Inst. Tag Installed", key: "tagInstalled" },
      { label: "Cable Tag Installed Correctly", key: "cableTagInstalled" },
      { label: "Cable Gland Is Fixed Well", key: "cableGlandFixed" },
      { label: "Cable Gland & Plug Are Certified", key: "cablePlugCertified" },
      { label: "Earth Cable Is Connected", key: "earthCableConnected" },
      { label: "Wire Terminals Are Tightly", key: "terminalsTight" },
      { label: "Cable Screen Not Connected", key: "cableScreenNotConnected" },
      { label: "DCS Reading", key: "dcsReading" },
      { label: "Device Housing Condition", key: "housingCondition" },
    ],
    Gauge: [
      { label: "Visual Inspection", key: "exInspection" },
      { label: "Sensor Element Status", key: "sensorStatus" },
      { label: "Inst. Tag Installed", key: "tagInstalled" },
      { label: "Gauge Glass Condition", key: "cableGlandFixed" },
      { label: "Filling With Glycerine", key: "cablePlugCertified" },
      { label: "Pointer Is Moving Smoothly", key: "earthCableConnected" },
      { label: "Isolation Manifold", key: "terminalsTight" },
      { label: "Device Housing Condition", key: "housingCondition" },
      { label: "Measuring System", key: "cableScreenNotConnected" },
    ],
    ControlValve: [
      { label: "Visual Inspection", key: "exInspection" },
      { label: "Pneumatic Supply Press. Is", key: "sensorStatus" },
      { label: "Inst. Tag Installed", key: "tagInstalled" },
      { label: "Cable Tag Installed Correctly", key: "cableTagInstalled" },
      { label: "Cable Gland Is Fixed Well", key: "cableGlandFixed" },
      { label: "Is There A Hunting Problem", key: "cablePlugCertified" },
      { label: "Earth Cable Is Connected", key: "earthCableConnected" },
      { label: "Positioner Status", key: "terminalsTight" },
      { label: "Function Test Result", key: "cableScreenNotConnected" },
      { label: "DCS Reading", key: "dcsReading" },
      { label: "Device Housing Condition", key: "housingCondition" },
    ],
    OnOffValve: [
      { label: "Visual Inspection", key: "exInspection" },
      { label: "Pneumatic Supply Press. Is", key: "sensorStatus" },
      { label: "Inst. Tag Installed", key: "tagInstalled" },
      { label: "Cable Tag Installed Correctly", key: "cableTagInstalled" },
      { label: "Cable Gland Is Fixed Well", key: "cableGlandFixed" },
      { label: "SOV And Other Components", key: "cablePlugCertified" },
      { label: "Earth Cable Is Connected", key: "earthCableConnected" },
      { label: "Position Transmitter", key: "terminalsTight" },
      { label: "Function Test Result", key: "cableScreenNotConnected" },
      { label: "DCS Reading", key: "dcsReading" },
      { label: "Device Housing Condition", key: "housingCondition" },
    ],
    Switch: [
      { label: "Visual Inspection", key: "exInspection" },
      { label: "Inst. Tag Installed", key: "tagInstalled" },
      { label: "Cable Tag Installed Correctly", key: "cableTagInstalled" },
      { label: "Cable Gland Is Fixed Well", key: "cableGlandFixed" },
      { label: "Cable Gland & Plug Are Certified", key: "cablePlugCertified" },
      { label: "Earth Cable Is Connected", key: "earthCableConnected" },
      { label: "Wire Terminals Are Tightly", key: "terminalsTight" },
      { label: "Function Test Result", key: "cableScreenNotConnected" },
      { label: "DCS Reading", key: "dcsReading" },
      { label: "Device Housing Condition", key: "housingCondition" },
    ],
    PCV: [
      { label: "Visual Inspection", key: "exInspection" },
      { label: "Function Test Result", key: "sensorStatus" },
      { label: "Inst. Tag Installed", key: "tagInstalled" },
      { label: "Is There Any External", key: "cableTagInstalled" },
      { label: "Is There Any Internal Leakage", key: "cableGlandFixed" },
      { label: "Slightly Change SP,Response Is", key: "cablePlugCertified" },
      { label: "Returned Back To Original SP", key: "earthCableConnected" },
      { label: "Device Housing Condition", key: "housingCondition" },
    ],
  };

  return checklistMappings[instrumentType] || checklistMappings["Transmitter"];
};

// Transmitter-specific layout
const TransmitterLayout: React.FC<{ form: CalibrationFormData }> = ({
  form,
}) => (
  <>
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Transmitter Data</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Tag:</Text>
        <Text style={styles.value}>{form.tag}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Range:</Text>
        <Text style={styles.value}>
          {form.rangeFrom} to {form.rangeTo} {form.unit}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Protocol:</Text>
        <Text style={styles.value}>{form.protocol}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Flow TX:</Text>
        <Text style={styles.value}>{form.flowTx}</Text>
      </View>
    </View>

    {/* Test Results Table */}
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Test Results</Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableHeader}>Type</Text>
          <Text style={styles.tableHeader}>0%</Text>
          <Text style={styles.tableHeader}>25%</Text>
          <Text style={styles.tableHeader}>50%</Text>
          <Text style={styles.tableHeader}>75%</Text>
          <Text style={styles.tableHeader}>100%</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Applied Upscale</Text>
          {(form.appliedUpscale || []).map((val, i) => (
            <Text key={i} style={styles.tableCell}>
              {val}
            </Text>
          ))}
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Actual Upscale</Text>
          {(form.actualUpscale || []).map((val, i) => (
            <Text
              key={i}
              style={
                isOutOfTolerance(
                  form.appliedUpscale[i],
                  val,
                  tolerancesValues.transmitterTolerance,
                  Math.abs(Number(form.rangeTo) - Number(form.rangeFrom))
                )
                  ? styles.redTableCell
                  : styles.tableCell
              }
            >
              {val}
            </Text>
          ))}
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Applied Downscale</Text>
          {(form.appliedDownscale || []).map((val, i) => (
            <Text key={i} style={styles.tableCell}>
              {val}
            </Text>
          ))}
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Actual Downscale</Text>
          {(form.actualDownscale || []).map((val, i) => (
            <Text
              key={i}
              style={
                isOutOfTolerance(
                  form.appliedDownscale[i],
                  val,
                  tolerancesValues.transmitterTolerance,
                  Math.abs(Number(form.rangeTo) - Number(form.rangeFrom))
                )
                  ? styles.redTableCell
                  : styles.tableCell
              }
            >
              {val}
            </Text>
          ))}
        </View>
      </View>
    </View>
  </>
);

// Gauge-specific layout
const GaugeLayout: React.FC<{ form: CalibrationFormData }> = ({ form }) => (
  <>
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Gauge Data</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Tag:</Text>
        <Text style={styles.value}>{form.tag}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Range:</Text>
        <Text style={styles.value}>
          {form.rangeFrom} to {form.rangeTo} {form.unit}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Gauge Type:</Text>
        <Text style={styles.value}>{form.gaugeType}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Medium:</Text>
        <Text style={styles.value}>{form.medium}</Text>
      </View>
    </View>

    {/* Test Results Table */}
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Test Results</Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableHeader}>Type</Text>
          <Text style={styles.tableHeader}>0%</Text>
          <Text style={styles.tableHeader}>25%</Text>
          <Text style={styles.tableHeader}>50%</Text>
          <Text style={styles.tableHeader}>75%</Text>
          <Text style={styles.tableHeader}>100%</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Applied Upscale</Text>
          {(form.appliedUpscale || []).map((val, i) => (
            <Text key={i} style={styles.tableCell}>
              {val}
            </Text>
          ))}
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Actual Upscale</Text>
          {(form.actualUpscale || []).map((val, i) => (
            <Text
              key={i}
              style={
                isOutOfTolerance(
                  form.appliedUpscale[i],
                  val,
                  tolerancesValues.gaugeTolerance,
                  Math.abs(Number(form.rangeTo) - Number(form.rangeFrom))
                )
                  ? styles.redTableCell
                  : styles.tableCell
              }
            >
              {val}
            </Text>
          ))}
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Applied Downscale</Text>
          {(form.appliedDownscale || []).map((val, i) => (
            <Text key={i} style={styles.tableCell}>
              {val}
            </Text>
          ))}
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Actual Downscale</Text>
          {(form.actualDownscale || []).map((val, i) => (
            <Text
              key={i}
              style={
                isOutOfTolerance(
                  form.appliedDownscale[i],
                  val,
                  tolerancesValues.gaugeTolerance,
                  Math.abs(Number(form.rangeTo) - Number(form.rangeFrom))
                )
                  ? styles.redTableCell
                  : styles.tableCell
              }
            >
              {val}
            </Text>
          ))}
        </View>
      </View>
    </View>
  </>
);

// 🔥 FIXED: Control Valve layout with FORCED table rendering
const ControlValveLayout: React.FC<{ form: CalibrationFormData }> = ({
  form,
}) => (
  <>
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Control Valve Data</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Tag:</Text>
        <Text style={styles.value}>{form.tag}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Size:</Text>
        <Text style={styles.value}>{form.size} Inch</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Protocol:</Text>
        <Text style={styles.value}>{form.protocol}</Text>
      </View>
    </View>

    {/* 🔥 FORCE RENDER: Test Results Table */}
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Test Results</Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableHeader}>Type</Text>
          <Text style={styles.tableHeader}>0%</Text>
          <Text style={styles.tableHeader}>25%</Text>
          <Text style={styles.tableHeader}>50%</Text>
          <Text style={styles.tableHeader}>75%</Text>
          <Text style={styles.tableHeader}>100%</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Applied Upscale</Text>
          <Text style={styles.tableCell}>
            {form.appliedUpscale?.[0] || "0"}
          </Text>
          <Text style={styles.tableCell}>
            {form.appliedUpscale?.[1] || "25"}
          </Text>
          <Text style={styles.tableCell}>
            {form.appliedUpscale?.[2] || "50"}
          </Text>
          <Text style={styles.tableCell}>
            {form.appliedUpscale?.[3] || "75"}
          </Text>
          <Text style={styles.tableCell}>
            {form.appliedUpscale?.[4] || "100"}
          </Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Actual Upscale</Text>
          {(form.actualUpscale || []).map((val, i) => (
            <Text
              key={i}
              style={
                isOutOfTolerance(
                  form.appliedUpscale[i],
                  val,
                  tolerancesValues.controlValveTolerance,
                  Math.abs(Number(form.rangeTo) - Number(form.rangeFrom))
                )
                  ? styles.redTableCell
                  : styles.tableCell
              }
            >
              {val}
            </Text>
          ))}
          {/* <Text style={styles.tableCell}>{form.actualUpscale?.[0] || ""}</Text>
          <Text style={styles.tableCell}>{form.actualUpscale?.[1] || ""}</Text>
          <Text style={styles.tableCell}>{form.actualUpscale?.[2] || ""}</Text>
          <Text style={styles.tableCell}>{form.actualUpscale?.[3] || ""}</Text>
          <Text style={styles.tableCell}>{form.actualUpscale?.[4] || ""}</Text> */}
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Applied Downscale</Text>
          <Text style={styles.tableCell}>
            {form.appliedDownscale?.[0] || "100"}
          </Text>
          <Text style={styles.tableCell}>
            {form.appliedDownscale?.[1] || "75"}
          </Text>
          <Text style={styles.tableCell}>
            {form.appliedDownscale?.[2] || "50"}
          </Text>
          <Text style={styles.tableCell}>
            {form.appliedDownscale?.[3] || "25"}
          </Text>
          <Text style={styles.tableCell}>
            {form.appliedDownscale?.[4] || "0"}
          </Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Actual Downscale</Text>
          {(form.actualDownscale || []).map((val, i) => (
            <Text
              key={i}
              style={
                isOutOfTolerance(
                  form.appliedDownscale[i],
                  val,
                  tolerancesValues.controlValveTolerance,
                  Math.abs(Number(form.rangeTo) - Number(form.rangeFrom))
                )
                  ? styles.redTableCell
                  : styles.tableCell
              }
            >
              {val}
            </Text>
          ))}
          {/* <Text style={styles.tableCell}>
            {form.actualDownscale?.[0] || ""}
          </Text>
          <Text style={styles.tableCell}>
            {form.actualDownscale?.[1] || ""}
          </Text>
          <Text style={styles.tableCell}>
            {form.actualDownscale?.[2] || ""}
          </Text>
          <Text style={styles.tableCell}>
            {form.actualDownscale?.[3] || ""}
          </Text>
          <Text style={styles.tableCell}>
            {form.actualDownscale?.[4] || ""}
          </Text> */}
        </View>
      </View>
    </View>
  </>
);

// 🔥 FIXED: On/Off Valve layout with FORCED table rendering
const OnOffValveLayout: React.FC<{ form: CalibrationFormData }> = ({
  form,
}) => (
  <>
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>On/Off Valve Data</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Tag:</Text>
        <Text style={styles.value}>{form.tag}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Size:</Text>
        <Text style={styles.value}>{form.size} Inch</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Valve Type:</Text>
        <Text style={styles.value}>{form.valveType}</Text>
      </View>
    </View>

    {/* 🔥 FORCE RENDER: Feedback and Timing Table */}
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Test Results</Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableHeader}>Order</Text>
          <Text style={styles.tableHeader}>Open</Text>
          <Text style={styles.tableHeader}>Close</Text>
          <Text style={styles.tableHeader}>Unit</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Feedback Value</Text>
          <Text
            style={
              isOutOfTolerance(
                "100",
                form.feedbackValueOpen,
                tolerancesValues!.onOffValveFeedbackTolerance,
                100
              )
                ? styles.redTableCell
                : styles.tableCell
            }
          >
            {form.feedbackValueOpen || ""}
          </Text>
          <Text
            style={
              isOutOfTolerance(
                "0",
                form.feedbackValueClose,
                tolerancesValues!.onOffValveFeedbackTolerance,
                100
              )
                ? styles.redTableCell
                : styles.tableCell
            }
          >
            {form.feedbackValueClose || ""}
          </Text>
          <Text style={styles.tableCell}>%</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Time</Text>
          <Text
            style={
              isValveTimeOutOfTolerance(
                Number(form.timeOpen),
                Number(tolerancesValues?.onOffValveTimeTolerance),
                Number(form.size),
                form.valveType
              ) &&
              (form.valveType.toUpperCase() === "BDV" ||
                form.valveType.toUpperCase() === "SEQUENCE")
                ? styles.redTableCell
                : styles.tableCell
            }
          >
            {form.timeOpen || ""}
          </Text>
          <Text
            style={
              isValveTimeOutOfTolerance(
                Number(form.timeClose),
                Number(tolerancesValues?.onOffValveTimeTolerance),
                Number(form.size),
                form.valveType
              ) &&
              (form.valveType.toUpperCase() === "SDV" ||
                form.valveType.toUpperCase() === "SEQUENCE")
                ? styles.redTableCell
                : styles.tableCell
            }
          >
            {form.timeClose || ""}
          </Text>
          <Text style={styles.tableCell}>SEC</Text>
        </View>
      </View>
    </View>
  </>
);

// Switch-specific layout
const SwitchLayout: React.FC<{ form: CalibrationFormData }> = ({ form }) => (
  <>
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Switch Data</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Tag:</Text>
        <Text style={styles.value}>{form.tag}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Switch Type:</Text>
        <Text style={styles.value}>{form.switchType}</Text>
      </View>
    </View>

    {/* Test Results */}
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Test Results</Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableHeader}>Status</Text>
          <Text style={styles.tableHeader}>Active</Text>
          <Text style={styles.tableHeader}>Healthy</Text>
          <Text style={styles.tableHeader}>Unit</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Test Result</Text>
          <Text
            style={
              isOutOfTolerance(
                form.setPointActive,
                form.testResultActive,
                tolerancesValues!.switchTolerance,
                Math.abs(
                  Number(form.setPointActive) - Number(form.setPointHealthy)
                )
              )
                ? styles.redTableCell
                : styles.tableCell
            }
          >
            {form.testResultActive}
          </Text>
          <Text
            style={
              isOutOfTolerance(
                form.setPointHealthy,
                form.testResultHealthy,
                tolerancesValues!.switchTolerance,
                Math.abs(
                  Number(form.setPointActive) - Number(form.setPointHealthy)
                )
              )
                ? styles.redTableCell
                : styles.tableCell
            }
          >
            {form.testResultHealthy}
          </Text>
          <Text style={styles.tableCell}>{form.unit}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Set Point</Text>
          <Text style={styles.tableCell}>{form.setPointActive}</Text>
          <Text style={styles.tableCell}>{form.setPointHealthy}</Text>
          <Text style={styles.tableCell}>{form.unit}</Text>
        </View>
      </View>
    </View>
  </>
);

// PCV-specific layout
const PCVLayout: React.FC<{ form: CalibrationFormData }> = ({ form }) => (
  <>
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>PCV Data</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Tag:</Text>
        <Text style={styles.value}>{form.tag}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Size:</Text>
        <Text style={styles.value}>{form.size} Inch</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Set Point:</Text>
        <Text style={styles.value}>
          {form.setPoint} {form.setPointUnit}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Regulating Target:</Text>
        <Text style={styles.value}>{form.regulatingTarget}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Valve Type:</Text>
        <Text style={styles.value}>{form.pcvValveType}</Text>
      </View>
    </View>
  </>
);

// Main render function
const renderInstrumentLayout = (form: CalibrationFormData) => {
  switch (form.type) {
    case "Transmitter":
      return <TransmitterLayout form={form} />;
    case "Gauge":
      return <GaugeLayout form={form} />;
    case "Control Valve":
      return <ControlValveLayout form={form} />;
    case "On-Off Valve":
      return <OnOffValveLayout form={form} />;
    case "Switch":
      return <SwitchLayout form={form} />;
    case "PCV":
      return <PCVLayout form={form} />;
    default:
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instrument Data</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Tag:</Text>
            <Text style={styles.value}>{form.tag}</Text>
          </View>
        </View>
      );
  }
};

interface PdfGeneratorProps {
  forms: CalibrationFormData[];
}

export const PdfGenerator: React.FC<PdfGeneratorProps> = ({ forms }) => (
  <Document>
    {forms.map((form, idx) => (
      <Page key={idx} style={styles.page} wrap>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <Text style={styles.header}>
              {form.type} Calibration Sheet - {form.tag}
            </Text>
          </View>
          <Image
            src="./Rashid-Logo.jpg"
            style={{ width: 60, height: 60, marginLeft: "auto" }}
          />
        </View>

        {/* Render instrument-specific layout */}
        {renderInstrumentLayout(form)}

        {/* 🔥 FIXED: Instrument-specific checklist */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inspection Checklist</Text>
          <View style={styles.checklistGrid}>
            {getChecklistForInstrument(form.type, form.checklist).map(
              ({ label, key }) => (
                <View key={key} style={styles.checklistItem}>
                  <Text style={styles.checklistLabel}>{label}:</Text>
                  <Text style={styles.checklistValue}>
                    {form.checklist[key] || ""}
                  </Text>
                </View>
              )
            )}
          </View>
        </View>

        {/* Comments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comments</Text>
          <Text>{form.comments}</Text>
        </View>

        {/* Signatures */}
        <View style={styles.signatures}>
          <View style={styles.signatureBox}>
            <Text>Created By:</Text>
            <Text style={{ fontWeight: "bold", marginTop: 5 }}>
              {form.createdBy}
            </Text>
          </View>
          <View style={styles.signatureBox}>
            <Text>Verified By:</Text>
            <Text style={{ fontWeight: "bold", marginTop: 5 }}>
              {form.verifiedBy}
            </Text>
          </View>
          <View style={styles.signatureBox}>
            <Text>Date:</Text>
            <Text style={{ fontWeight: "bold", marginTop: 5 }}>
              {form.date}
            </Text>
          </View>
        </View>
      </Page>
    ))}
  </Document>
);

export function PdfDownloadButton({
  forms,
  tolerances,
  onAfterDownload,
}: {
  forms: CalibrationFormData[];
  tolerances: tolerancesType | null;
  onAfterDownload: () => void;
}) {
  tolerancesValues = tolerances || {
    transmitterTolerance: 0,
    gaugeTolerance: 0,
    controlValveTolerance: 0,
    onOffValveTimeTolerance: 0,
    onOffValveFeedbackTolerance: 0,
    switchTolerance: 0,
    unit: "%",
  };

  const [hasDownloaded, setHasDownloaded] = React.useState(false);
  return (
    <>
      <PDFDownloadLink
        document={<PdfGenerator forms={forms} />}
        fileName="calibration_sheets.pdf"
        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
      >
        {({ loading }) =>
          loading
            ? "Preparing PDF..."
            : !hasDownloaded && (
                <Button
                  onClick={() => setHasDownloaded(true)}
                  style={{
                    backgroundColor: "#16a34a", // Tailwind green-600
                    color: "#fff",
                    fontWeight: 600,
                    padding: "0.5rem 1rem",
                    borderRadius: "0.375rem",
                    boxShadow: "0 1px 2px rgb(0 0 0 / 0.05)",
                    cursor: "pointer",
                    transition: "background-color 0.15s ease-in-out",
                    border: "none",
                    marginLeft: "1rem",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#15803d")
                  } // hover green-700
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#16a34a")
                  }
                >
                  Export All Calibration Sheets
                </Button>
              )
        }
      </PDFDownloadLink>
      {hasDownloaded && (
        <Button
          style={{
            marginTop: "1rem",
            backgroundColor: "#28a745",
            color: "#fff",
            fontWeight: "600",
            padding: "0.5rem 1rem",
            borderRadius: "0.375rem",
            cursor: "pointer",
          }}
          onClick={() => {
            setHasDownloaded(false);
            onAfterDownload();
          }}
        >
          Click Here To Modify The Sheets
        </Button>
      )}
    </>
  );
}
