

/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão 1.0.1 - 03/02/2016
 *  - Opção de impressão disponível
 *
 *  Versão 1.0 - 05/11/2015
 *
 */

// App
angular.module("card-services-conciliacao-relatorios", []) 

.controller("card-services-conciliacao-relatoriosCtrl", ['$scope',   
                                            '$state',
                                            '$http',
                                            '$window',
                                            /*'$campos',*/
                                            '$webapi',
                                            '$apis', 
                                            '$timeout',
                                            '$filter',
                                            function($scope,$state,$http,$window,/*$campos,*/
                                                     $webapi,$apis,$timeout,$filter){  
    
    $scope.filiais = [];   
    $scope.relatorio = [];                                      
    $scope.filtro = { data : new Date(), filial : null }; 
    $scope.total = { valorBruto : 0.0, valorDescontado : 0.0, valorLiquido : 0.0,
                     valorRecebido : 0.0, valorAReceber : 0.0 };  
    var divPortletBodyFiltrosPos = 0; // posição da div que vai receber o loading progress
    var divPortletBodyRelatorioPos = 1; // posição da div que vai receber o loading progress                                         
    // flags                                   
    $scope.exibeTela = false;         
    $scope.abrirCalendarioData = false;                                             
                                                
    // Inicialização do controller
    $scope.cardServices_conciliacaoRelatoriosInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Conciliação';                          
        $scope.pagina.subtitulo = 'Relatórios';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
        // Quando houver alteração do grupo empresa na barra administrativa                                           
        $scope.$on('alterouGrupoEmpresa', function(event){ 
            if($scope.exibeTela){
                // Avalia grupo empresa
                if($scope.usuariologado.grupoempresa){ 
                    // Reseta seleção de filtro específico de empresa
                    $scope.filtro.filial = null;
                    buscaFiliais();
                }else{ // reseta tudo e não faz buscas 
                    $scope.filiais = []; 
                    $scope.filtro.filial = null;
                }
            }
        }); 
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // Carrega filiais
            buscaFiliais();
        }); 
        // Acessou a tela
        $scope.$emit("acessouTela");
        //$scope.exibeTela = true;
        //buscaFiliais();
    };                                           
                                                
                                            
    
        
                                                
   /* FILTRO */
                                                
   /**
      * Obtém os filtros de busca
      */
    var obtemFiltrosBusca = function(){
        var filtros = [];
        
        // Filtros Por Data
        filtros.push({id: /*$campos.card.conciliacaorelatorios.data*/ 100,
                      valor: $scope.getFiltroData($scope.filtro.data, true)});

        // Filial
        if($scope.filtro.filial && $scope.filtro.filial !== null){
           filtros.push({id: /*$campos.card.conciliacaorelatorios.nu_cnpj*/ 102, 
                         valor: $scope.filtro.filial.nu_cnpj});  
        }

        return filtros;
    }                                             
    
    /**
      * Limpa os filtros
      */
    $scope.limpaFiltros = function(){
        $scope.filtro.filial = null; 
    }
    
    
    // DATA DA VENDA
    $scope.exibeCalendario = function($event) {
        if($event){
            $event.preventDefault();
            $event.stopPropagation();
        }
        $scope.abrirCalendario = !$scope.abrirCalendario;
    };
    $scope.alterouData = function(){
        //console.log($scope.filtro.data);
    };
    
    
                                                 
    
    // FILIAIS
    /**
      * Busca as filiais
      */
    var buscaFiliais = function(nu_cnpj){
        
       if(!$scope.usuariologado.grupoempresa || $scope.usuariologado.grupoempresa === null) return;
        
       $scope.showProgress(divPortletBodyFiltrosPos, 10000);    
        
       var filtros = [];
        
       // Somente com status ativo
       filtros.push({id: /*$campos.cliente.empresa.fl_ativo*/ 114, valor: 1});

       // Filtro do grupo empresa => barra administrativa
       filtros.push({id: /*$campos.cliente.empresa.id_grupo*/ 116, valor: $scope.usuariologado.grupoempresa.id_grupo});
       if($scope.usuariologado.empresa) filtros.push({id: /*$campos.cliente.empresa.nu_cnpj*/ 100, 
                                                      valor: $scope.usuariologado.empresa.nu_cnpj});
       
       
       $webapi.get($apis.getUrl($apis.cliente.empresa, 
                                [$scope.token, 0, /*$campos.cliente.empresa.ds_fantasia*/ 104],
                                filtros)) 
            .then(function(dados){
                $scope.filiais = dados.Registros;
                // Reseta
                if(!nu_cnpj) $scope.filtro.destinatario = null;
                else $scope.filtro.destinatario = $filter('filter')($scope.filiais, function(f) {return f.nu_cnpj === nu_cnpj;})[0];
                $scope.hideProgress(divPortletBodyFiltrosPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter filiais (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
              });     
    };
    /**
      * Selecionou uma filial
      */
    $scope.alterouFilial = function(){
        //console.log($scope.filtro.destinatario); 
    }; 
                                                
                                                
                                                
    
    // RELATÓRIO DE VENDAS                                          
    /**
      * Obtem o relatório a partir dos filtros
      */
    $scope.buscaRelatorioConciliacao = function(){
        // Avalia se há um grupo empresa selecionado
        if(!$scope.usuariologado.grupoempresa){
            $scope.showModalAlerta('Por favor, selecione uma empresa', 'Atos Capital', 'OK', 
                                   function(){
                                         $timeout(function(){ $scope.setVisibilidadeBoxGrupoEmpresa(true);}, 300);
                                    }
                                  );
            return;   
        }
        /*// Data deve ser superior ou igual a data corrente
        var dtNow = new Date();
        if($scope.filtro.datamin && 
           ($scope.filtro.datamin.getFullYear() > dtNow.getFullYear() || ($scope.filtro.datamin.getFullYear() === dtNow.getFullYear() && $scope.filtro.datamin.getMonth() > dtNow.getMonth()) || ($scope.filtro.datamin.getFullYear() === dtNow.getFullYear() && $scope.filtro.datamin.getMonth() === dtNow.getMonth() && $scope.filtro.datamin.getDate() >= dtNow.getDate()))){
            $scope.showModalAlerta('Data inicial deve ser inferior à data corrente!', 'Atos Capital', 'OK', 
               function(){
                     $timeout(function(){$scope.exibeCalendarioDataMin();}, 300);
                }
              );
            return; 
        }
        if($scope.datamax && 
           ($scope.filtro.datamax.getFullYear() < $scope.filtro.datamin.getFullYear() || ($scope.filtro.datamax.getFullYear() === $scope.filtro.datamin.getFullYear() && $scope.filtro.datamax.getMonth() < $scope.filtro.datamin.getMonth()) || ($scope.filtro.datamax.getFullYear() === $scope.filtro.datamin.getFullYear() && $scope.filtro.datamax.getMonth() === $scope.filtro.datamin.getMonth() && $scope.filtro.datamax.getDate() < $scope.filtro.datamin.getDate()))){
            $scope.showModalAlerta('Data final deve ser igual ou superior à data inicial!', 'Atos Capital', 'OK', 
               function(){
                     $timeout(function(){$scope.exibeCalendarioDataMax();}, 300);
                }
              );
            return; 
        }*/
        // Nova busca
        buscaRelatorioConciliacao();
    }
                                                
                                                
    var buscaRelatorioConciliacao = function(){
        // Abre os progress
       $scope.showProgress(divPortletBodyFiltrosPos, 10000); // z-index < z-index do fullscreen     
       $scope.showProgress(divPortletBodyRelatorioPos);
        
       // Filtros    
       var filtros = obtemFiltrosBusca();
           
       //console.log(filtros);
       $webapi.get($apis.getUrl($apis.card.conciliacaorelatorios, [$scope.token, 0], filtros)) 
            .then(function(dados){
                //console.log(dados);
                // Obtém os dados
                $scope.relatorio = dados.Registros;
                // Totais
                //$scope.total.valorBruto = dados.Totais.valorBruto;
                //$scope.total.valorDescontado = dados.Totais.valorDescontado;
                //$scope.total.valorLiquido = dados.Totais.valorLiquido;
                //$scope.total.valorRecebido = dados.Totais.valorRecebido;
                //$scope.total.valorAReceber = dados.Totais.valorAReceber;

                // Fecha os progress
                $scope.hideProgress(divPortletBodyFiltrosPos);
                $scope.hideProgress(divPortletBodyRelatorioPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter relatório de conciliação (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
                 $scope.hideProgress(divPortletBodyRelatorioPos);
              });           
    }
                                                
                                                
                                                
    // TABELA EXPANSÍVEL
    $scope.toggle = function(item){
        if(!item || item === null) return;
        if(item.collapsed) item.collapsed = false;
        else item.collapsed = true;
    }
    $scope.isExpanded = function(item){
        if(!item || item === null) return false;
        return item.collapsed;
    }
		
		//IMPRESSÃO
		$scope.imprimir = function(temNivel){
			
			/*
			
			e = Nome da empresa
			s = Nome da tela
			n = Número de níveis
			cl = Número de colunas
			t = Token
			c = CNPJ
			f = Filial
			d = Data
			
			*/
			
			$scope.c = "todos";
			$scope.f = "todas";
			if($scope.filtro.filial && $scope.filtro.filial !== null){  
				$scope.c = $scope.filtro.filial.nu_cnpj;
				$scope.f = $scope.filtro.filial.ds_fantasia;				
			}
			$scope.tn = temNivel;
			
				$window.open('views/print#?e=' + $scope.usuariologado.grupoempresa.ds_nome + '&s=' + "Relatório de Conciliação" + '&n='+ 3
										 +'&cl='+12+'&t='+$scope.token+'&tn='+$scope.tn+'&c='+$scope.c+'&f='+$scope.f+
										 '&d='+$scope.getFiltroData($scope.filtro.data, true), '_blank');
			}			
		
            
}]);