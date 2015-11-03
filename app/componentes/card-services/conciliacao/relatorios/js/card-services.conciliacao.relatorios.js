/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão 1.0 - 03/09/2015
 *
 */

// App
angular.module("card-services-conciliacao-relatorios", []) 

.controller("card-services-conciliacao-relatoriosCtrl", ['$scope','$state',function($scope,$state){ 
    
    // flags
    $scope.exibeTela = false;
    // Data
    $scope.adquirentes = [{
        adquirente : 'Cielo',	
        bandeiras: [{	
                    bandeira: 'Master',	
                    competencia:'SET/2015',  
                    competencias: [{
                                    competencia:'01/09/2015',
                                    taxaMedia : 1,	
                                    vendas : 2,
                                    taxaAdm : 3, 
                                    ajustesCredito: 4,
                                    ajustesDebito : 5, 
                                    valorLiquido : 6,
                                    extratoBancario : 7,
                                    diferenca : 8, 
                                    status : 'Pré Conciliado',},
                                  {
                                    competencia:'02/09/2015',
                                    taxaMedia : 1,	
                                    vendas : 2,
                                    taxaAdm : 3, 
                                    ajustesCredito: 4,
                                    ajustesDebito : 5, 
                                    valorLiquido : 6,
                                    extratoBancario : 7,
                                    diferenca : 8, 
                                    status : 'Pré Conciliado',},
                                  {
                                    competencia:'03/09/2015',
                                    taxaMedia : 1,	
                                    vendas : 2,
                                    taxaAdm : 3, 
                                    ajustesCredito: 4,
                                    ajustesDebito : 5, 
                                    valorLiquido : 6,
                                    extratoBancario : 7,
                                    diferenca : 8, 
                                    status : 'Pré Conciliado',}],
                    taxaMedia : 1,	
                    vendas : 2,
                    taxaAdm : 3, 
                    ajustesCredito: 4,
                    ajustesDebito : 5, 
                    valorLiquido : 6,
                    extratoBancario : 7,
                    diferenca : 8, 
                    status : 'Pré-Conciliado',
                },
                  {	
                    bandeira: 'Visa',	
                    competencia:'OUT/2015',  
                    competencias: [{competencia:'01/10/2015',
                                    taxaMedia : 1,	
                                    vendas : 2,
                                    taxaAdm : 3, 
                                    ajustesCredito: 4,
                                    ajustesDebito : 5, 
                                    valorLiquido : 6,
                                    extratoBancario : 7,
                                    diferenca : 8,
                                    status : 'Não Conciliado',}],
                    taxaMedia : 1,	
                    vendas : 2,
                    taxaAdm : 3, 
                    ajustesCredito: 4,
                    ajustesDebito : 5, 
                    valorLiquido : 6,
                    extratoBancario : 7,
                    diferenca : 8,
                    status : 'Não Conciliado',
                }],
        taxaMedia : 1,	
        vendas : 2,
        taxaAdm : 3, 
        ajustesCredito: 4,
        ajustesDebito : 5, 
        valorLiquido : 6,
        extratoBancario : 7,
        diferenca : 8,
        status : 'Pré-Conciliado',
    }];
    $scope.emitentes = [];
    $scope.datamin = new Date();
    $scope.datamax = null;
    $scope.abrirCalendarioDataMin = false;
    $scope.abrirCalendarioDataMax = false;
    
    // Inicialização do controller
    $scope.cardServices_conciliacaoRelatoriosInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Card Services';                          
        $scope.pagina.subtitulo = 'Relatórios';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // Carrega dados
            // ....
        });
        // Acessou a tela
        $scope.$emit("acessouTela");
    };
    
    // DATA
    var ajustaIntervaloDeData = function(){
      // Verifica se é necessário reajustar a data max para ser no mínimo igual a data min
      if($scope.datamax !== null && $scope.datamax < $scope.datamin) $scope.datamax = $scope.datamin;
      if(!$scope.$$phase) $scope.$apply();
    };
    // Data MIN
    $scope.exibeCalendarioDataMin = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.abrirCalendarioDataMin = !$scope.abrirCalendarioDataMin;
        $scope.abrirCalendarioDataMax = false;
      };
    $scope.alterouDataMin = function(){
      ajustaIntervaloDeData();
    };
    // Data MAX
    $scope.exibeCalendarioDataMax = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.abrirCalendarioDataMax = !$scope.abrirCalendarioDataMax;
        $scope.abrirCalendarioDataMin = false;
      };
    $scope.alterouDataMax = function(){
      ajustaIntervaloDeData();
    };
    $scope.limpaDataMax = function () {
        $scope.datamax = null;
      };
        
     // LINHAS EXPANSÍVEIS
    
    //ADQUIRENTE
    $scope.toggle = function(adquirente){
        if(!adquirente || adquirente === null) return;
        if(adquirente.collapsed) adquirente.collapsed = false;
        else adquirente.collapsed = true;
        //console.log(adquirente);
    }
    $scope.isExpanded = function(adquirente){
        if(!adquirente || adquirente === null) return;
        return adquirente.collapsed;
    }
    
    //BANDEIRA
    $scope.toggle = function(bandeira){
        if(!bandeira || bandeira === null) return;
        if(bandeira.collapsed) bandeira.collapsed = false;
        else bandeira.collapsed = true;
        console.log(bandeira);
    }
    $scope.isExpanded = function(bandeira){
        if(!bandeira || bandeira === null) return;
        return bandeira.collapsed;
    }
    
        
}]);