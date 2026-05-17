import { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { useThemeTokens } from "../../../theme";
import { useNightGuideStore } from "../../../stores/useNightGuideStore";
import { NIGHT_GUIDE_TITLE } from "../../../constants/nightGuideConstants";
import type { RootStackParamList } from "../../../navigation/RootStack";
import type { NightGuide, NightGuideTask, NightGuideOccurrence } from "../../../constants/types";
import * as nightGuideRepository from "../../../data/repositories/nightGuideRepository";
import TaskChecklist from "../../../components/nightGuide/TaskChecklist/TaskChecklist";
import ReflectionInput from "../../../components/nightGuide/ReflectionInput/ReflectionInput";
import MotivationalSentencesReader from "../../../components/motivationalSentences/MotivationalSentencesReader/MotivationalSentencesReader";
import { getRandomNightMotivationalSentences } from "../../../constants/defaultNightMotivationalSentences";
import { getIstDateString, getIstTimeString, getGraceDeadlineMs } from "../../../utils/istDate";
import { rescheduleNightGuide } from "../../../services/nightGuideScheduler";
import { styles } from "./styles";

type NavProp = NativeStackNavigationProp<RootStackParamList>;
type ActiveRoute = RouteProp<RootStackParamList, "NightGuideActive">;

/** Check if the current IST time is at or past the guide's scheduled time */
function isOccurrenceTime(guide: NightGuide | null): boolean {
  if (!guide) return true;
  const nowTime = getIstTimeString();
  return nowTime >= guide.time;
}

export default function NightGuideActiveScreen() {
  const t = useThemeTokens();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<ActiveRoute>();
  const { guideId, occurrenceId, mode = "full" } = route.params;
  const isTasksOnly = mode === "tasks-only";
  const isReadOnly = mode === "readonly";

  const { loadGuides, loadOccurrences } = useNightGuideStore();
  const [guide, setGuide] = useState<NightGuide | null>(null);
  const [tasks, setTasks] = useState<NightGuideTask[]>([]);
  const [occurrence, setOccurrence] = useState<NightGuideOccurrence | null>(null);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [reflectionDone, setReflectionDone] = useState(false);
  const [phase, setPhase] = useState<"tasks" | "reflection" | "motivational" | "done">("tasks");
  const [motivationalSentences, setMotivationalSentences] = useState<string[]>([]);
  const [pendingReflection, setPendingReflection] = useState<{ question: string; response: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const g = await nightGuideRepository.getNightGuideById(guideId);
      setGuide(g);
      const t = await nightGuideRepository.getTasksForNightGuide(guideId);
      setTasks(t);
      if (occurrenceId) {
        const occ = await nightGuideRepository.getOccurrenceById(occurrenceId);
        setOccurrence(occ);
        if (occ && occ.status === "completed" && !isReadOnly) {
          setPhase("done");
        } else if (occ && occ.status === "pending" && occ.completedTaskIds.length > 0) {
          // Bug A fix: restore completed task state for partial completion
          setCompletedTaskIds(occ.completedTaskIds);
          setCompletedTasks(occ.completedTaskIds.length);
        }
      }
    } catch (err) {
      console.error("Failed to load night guide data:", err);
    }
    setIsLoading(false);
  };

  const handleTasksComplete = useCallback((count: number, ids: string[]) => {
    setCompletedTasks(count);
    setCompletedTaskIds(ids);
  }, []);

  const handleMotivationalSentencesComplete = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);

    const now = Date.now();
    const occId = occurrenceId || `${guideId}_${getIstDateString()}`;
    const taskScore = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 50) : 0;
    const compPct = tasks.length > 0 ? taskScore + 50 : 100;

    try {
      if (!occurrenceId) {
        const todayStr = getIstDateString();
        await nightGuideRepository.upsertOccurrence({
          id: occId,
          nightGuideId: guideId,
          scheduledDate: todayStr,
          status: "completed",
          completionPercentage: compPct,
          completedTaskIds: completedTaskIds,
          graceDeadlineAt: getGraceDeadlineMs(todayStr),
          createdAt: now,
          completedAt: now,
        });
      } else {
        await nightGuideRepository.updateOccurrenceStatus(occId, "completed", compPct, completedTaskIds, now);
      }
      if (pendingReflection) {
        await nightGuideRepository.saveNightReflection({
          id: `ref_${occId}_${now}`,
          nightGuideId: guideId,
          occurrenceId: occId,
          question: pendingReflection.question,
          response: pendingReflection.response,
          completionPercentage: compPct,
          createdAt: now,
        });
      }
      if (guide && guide.weekdays.length > 0) {
        await rescheduleNightGuide(guide);
      }
      await nightGuideRepository.autoDisableOneTimeGuideIfCompleted(guideId);
      loadGuides();
      loadOccurrences();
    } catch (err) {
      console.error("Failed to save night guide completion:", err);
    }
    setPhase("done");
    setIsSaving(false);
  }, [guideId, occurrenceId, completedTasks, tasks.length, pendingReflection, guide, loadGuides, loadOccurrences, isSaving]);

  const handleReflectionComplete = useCallback(
    async (question: string, response: string) => {
      setReflectionDone(true);
      setPendingReflection({ question, response });
      setMotivationalSentences(getRandomNightMotivationalSentences());
      setPhase("motivational");
    },
    []
  );

  const handleTasksDone = useCallback(async () => {
    if (isTasksOnly) {
      const now = Date.now();
      const occId = occurrenceId || `${guideId}_${getIstDateString()}`;
      const compPct = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 100;
      const allDone = completedTasks >= tasks.length;

      // Check if current time is before the scheduled guide time
      const g = guide || await nightGuideRepository.getNightGuideById(guideId);
      const isBeforeTime = !isOccurrenceTime(g);

      try {
        if (!occurrenceId) {
          const todayStr = getIstDateString();
          await nightGuideRepository.upsertOccurrence({
            id: occId,
            nightGuideId: guideId,
            scheduledDate: todayStr,
            // Bug A: before scheduled time → save as pending so user can revisit
            status: allDone || !isBeforeTime ? "completed" : "pending",
            completionPercentage: compPct,
            completedTaskIds: completedTaskIds,
            graceDeadlineAt: getGraceDeadlineMs(todayStr),
            createdAt: now,
            completedAt: allDone || !isBeforeTime ? now : undefined,
          });
        } else {
          const status = allDone || !isBeforeTime ? "completed" : "pending";
          await nightGuideRepository.updateOccurrenceStatus(occId, status, compPct, completedTaskIds, allDone || !isBeforeTime ? now : undefined);
        }
        if (guide && guide.weekdays.length > 0) {
          await rescheduleNightGuide(guide);
        }
        await nightGuideRepository.autoDisableOneTimeGuideIfCompleted(guideId);
        loadGuides();
        loadOccurrences();
      } catch (err) {
        console.error("Failed to save task completion:", err);
      }
      setPhase("done");
    } else {
      setPhase("reflection");
    }
  }, [isTasksOnly, occurrenceId, guideId, completedTasks, completedTaskIds, tasks.length, guide, loadGuides, loadOccurrences]);

  const dateHeaderLabel = useMemo(() => {
    if (!occurrence?.scheduledDate) return null;
    try {
      const [y, m, d] = occurrence.scheduledDate.split("-").map(Number);
      const date = new Date(y, m - 1, d);
      const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      return `${weekdays[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    } catch {
      return null;
    }
  }, [occurrence?.scheduledDate]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: t.bg.app }]}>
        <View style={styles.center}>
          <Text style={[styles.loadingText, { color: t.text.secondary }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: t.bg.app }]}>
      {isReadOnly && (
        <View style={{ paddingHorizontal: 16, paddingVertical: 12, flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4, marginRight: 8 }}>
            <Ionicons name="arrow-back" size={24} color={t.icon.primary} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ color: t.text.primary, fontSize: 18, fontWeight: "600" }}>
              {NIGHT_GUIDE_TITLE} History
            </Text>
            {dateHeaderLabel && (
              <Text
                style={{ color: t.text.secondary, fontSize: 13, marginTop: 2 }}
                numberOfLines={1}
              >
                {dateHeaderLabel}
              </Text>
            )}
          </View>
          <View style={{ width: 24 }} />
        </View>
      )}
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {phase === "done" && !isReadOnly ? (
          <View style={styles.goodNightContainer}>
            <Ionicons name={isTasksOnly ? "checkmark-circle" : "moon"} size={80} color={t.accent.softSky} />
            <Text style={[styles.goodNightTitle, { color: t.text.primary }]}>
              {isTasksOnly ? "Tasks Complete!" : "Good Night!"}
            </Text>
            <Text style={[styles.goodNightSubtitle, { color: t.text.secondary }]}>
              {isTasksOnly
                ? `You've completed ${completedTasks} of ${tasks.length} tasks for today's ${NIGHT_GUIDE_TITLE}.`
                : `You've completed your ${NIGHT_GUIDE_TITLE} routine. Rest well.`}
            </Text>
            <TouchableOpacity
              style={[styles.doneBtn, { backgroundColor: t.action.primaryBg }]}
              onPress={() => navigation.goBack()}
            >
              <Text style={[styles.doneBtnText, { color: t.action.primaryText }]}>Finish</Text>
            </TouchableOpacity>
          </View>
        ) : phase === "motivational" ? (
          <>
            <View style={styles.header}>
              <Ionicons name="moon-outline" size={24} color={t.accent.softSky} />
              <Text style={[styles.headerTitle, { color: t.text.primary }]}>{NIGHT_GUIDE_TITLE}</Text>
              {guide?.label && <Text style={[styles.headerSubtitle, { color: t.text.secondary }]}>{guide.label}</Text>}
            </View>
            <MotivationalSentencesReader
              sentences={motivationalSentences}
              onComplete={handleMotivationalSentencesComplete}
              enableTextToSpeech={true}
            />
          </>
        ) : (
          <>
            <View style={styles.header}>
              <Ionicons name="moon-outline" size={24} color={t.accent.softSky} />
              <Text style={[styles.headerTitle, { color: t.text.primary }]}>{NIGHT_GUIDE_TITLE}</Text>
              {guide?.label && <Text style={[styles.headerSubtitle, { color: t.text.secondary }]}>{guide.label}</Text>}
            </View>

            {/* Task Checklist */}
            {tasks.length > 0 && phase === "tasks" && (
              <TaskChecklist
                tasks={tasks}
                onComplete={handleTasksComplete}
                readOnly={isReadOnly}
                completedTaskIds={isReadOnly || (occurrence?.completedTaskIds.length ?? 0) > 0 ? (occurrence?.completedTaskIds ?? []) : undefined}
              />
            )}
            {tasks.length === 0 && phase === "tasks" && (
              <View style={{ alignItems: "center", paddingVertical: 40 }}>
                <Text style={{ color: t.text.secondary, fontSize: 16 }}>
                  {isReadOnly ? "No tasks configured for this guide." : isTasksOnly ? "No tasks for this guide." : "No tasks configured. Tap to continue."}
                </Text>
              </View>
            )}

            {/* Button: tasks-only, full flow, or read-only back */}
            {phase === "tasks" && !isReadOnly && (
              <TouchableOpacity
                style={[styles.nextBtn, { backgroundColor: t.action.primaryBg }]}
                onPress={handleTasksDone}
              >
                <Text style={[styles.nextBtnText, { color: t.action.primaryText }]}>
                  {isTasksOnly ? "Finish" : tasks.length === 0 ? "Start Reflection" : "Continue to Reflection"}
                </Text>
              </TouchableOpacity>
            )}

            {/* Read-only back button */}
            {isReadOnly && (
              <TouchableOpacity
                style={[styles.nextBtn, { backgroundColor: t.action.primaryBg }]}
                onPress={() => navigation.goBack()}
              >
                <Text style={[styles.nextBtnText, { color: t.action.primaryText }]}>Back to History</Text>
              </TouchableOpacity>
            )}

            {/* Reflection (full mode only) */}
            {phase === "reflection" && !reflectionDone && !isTasksOnly && (
              <ReflectionInput onComplete={handleReflectionComplete} />
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
