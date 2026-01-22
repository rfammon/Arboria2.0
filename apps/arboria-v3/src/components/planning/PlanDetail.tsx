import { Card, CardContent } from '../ui/card';
import { useAuth } from '../../context/AuthContext';
import type { InterventionPlan } from '../../types/plan';
import {
    formatDateTime,
    getDaysUntilExecution,
    getUrgencyBadgeConfig,
    INTERVENTION_ICONS,
    INTERVENTION_COLORS,
} from '../../lib/planUtils';
import { openNavigationApp } from '../../utils/mapUtils';
import { usePlanActions } from '../../hooks/usePlanActions';

// Sub-components
import { PlanHeader } from './PlanDetailComponents/PlanHeader';
import { PlanTreeInfo } from './PlanDetailComponents/PlanTreeInfo';
import { PlanWorkOrders } from './PlanDetailComponents/PlanWorkOrders';
import { PlanRequirements } from './PlanDetailComponents/PlanRequirements';
import { DeletePlanDialog } from './PlanDetailComponents/DeletePlanDialog';
import { AssignWODialog } from './PlanDetailComponents/AssignWODialog';
import { ReopenWODialog } from './PlanDetailComponents/ReopenWODialog';

interface PlanDetailProps {
    plan: InterventionPlan;
    onBack: () => void;
    onEdit: (plan: InterventionPlan) => void;
    onUpdate?: () => void;
}

export function PlanDetail({ plan, onBack, onEdit, onUpdate }: PlanDetailProps) {
    const { activeProfileNames } = useAuth();
    
    const {
        showDeleteDialog,
        setShowDeleteDialog,
        showAssignDialog,
        setShowAssignDialog,
        showReopenDialog,
        setShowReopenDialog,
        isDeleting,
        isGenerating,
        isReopening,
        members,
        selectedAssignee,
        setSelectedAssignee,
        reopenReason,
        setReopenReason,
        reopenDate,
        setReopenDate,
        handleOpenGenerateDialog,
        handleConfirmGeneration,
        handleOpenReopenDialog,
        handleConfirmReopen,
        handleDeleteWorkOrder,
        handleDeletePlan,
    } = usePlanActions(plan, onBack, onUpdate);

    const isManager = activeProfileNames.split(', ').some(p => ['Gestor', 'Mestre', 'Planejador'].includes(p));

    const icon = INTERVENTION_ICONS[plan.intervention_type] || '📌';
    const color = INTERVENTION_COLORS[plan.intervention_type] || '#666';
    const daysUntil = getDaysUntilExecution(plan.schedule);
    const urgencyConfig = getUrgencyBadgeConfig(daysUntil);

    return (
        <div className="space-y-6">
            <PlanHeader 
                plan={plan}
                onBack={onBack}
                onEdit={onEdit}
                onDelete={() => setShowDeleteDialog(true)}
                onGenerateOS={handleOpenGenerateDialog}
                isGenerating={isGenerating}
                daysUntil={daysUntil}
                urgencyConfig={urgencyConfig}
                icon={icon}
            />

            <PlanTreeInfo 
                tree={plan.tree}
                onNavigate={openNavigationApp}
            />

            <PlanWorkOrders 
                workOrders={plan.work_orders || []}
                isManager={isManager}
                onDeleteWorkOrder={handleDeleteWorkOrder}
                onOpenReopenDialog={handleOpenReopenDialog}
            />

            <PlanRequirements 
                plan={plan}
                color={color}
            />

            {/* Metadata Footer */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div>
                            <span className="font-medium">Criado em: </span>
                            {formatDateTime(plan.created_at)}
                        </div>
                        <div>
                            <span className="font-medium">Última atualização: </span>
                            {formatDateTime(plan.updated_at)}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <AssignWODialog 
                open={showAssignDialog}
                onOpenChange={setShowAssignDialog}
                onConfirm={handleConfirmGeneration}
                isGenerating={isGenerating}
                members={members}
                selectedAssignee={selectedAssignee}
                onAssigneeChange={setSelectedAssignee}
            />

            <ReopenWODialog 
                open={showReopenDialog}
                onOpenChange={setShowReopenDialog}
                onConfirm={handleConfirmReopen}
                isReopening={isReopening}
                reason={reopenReason}
                onReasonChange={setReopenReason}
                date={reopenDate}
                onDateChange={setReopenDate}
            />

            <DeletePlanDialog 
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                onConfirm={handleDeletePlan}
                isDeleting={isDeleting}
                planId={plan.plan_id}
            />
        </div>
    );
}
